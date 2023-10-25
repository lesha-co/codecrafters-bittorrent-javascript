import net from "node:net";
import {
  AddressInfo,
  BLOCK_LENGTH,
  TorrentFile,
  getMetrics,
  infoHash,
} from "./model";
import { concat, toHex, toUint8Array } from "./compat";
import EventEmitter from "node:events";
import {
  NotEnoughDataError,
  PeerMessage,
  PeerMessagePiece,
  PeerMessageRequest,
  decodePeerMessage,
  encodePeerMessage,
  peerMessageToString,
} from "./peerMessage";

class PartedDownloadManager {
  private items: number[];
  constructor(nItems: number) {
    this.items = new Array(nItems).fill(false).map((x, i) => i);
  }
  public getAnyItem() {
    if (this.items.length === 0) {
      return null;
    }
    const index =
      Math.round(this.items.length * Math.random()) % this.items.length;
    return this.items[index];
  }
  public completeItem(itemIndex: number) {
    const index = this.items.indexOf(itemIndex);
    if (index == -1) {
      throw new Error("was already completed");
    }
    this.items.splice(index, 1);
  }
}

export class PeerAgent extends EventEmitter {
  private connection: net.Socket;
  /**
   * Our peer id
   */
  private ourPeerID = new Uint8Array(20).map((x) =>
    Math.round(Math.random() * 256)
  );
  /**
   * has value if other peer responded to handshake
   */
  private theirPeerID: Uint8Array | undefined = undefined;

  /**
   * has value if peer sent their bitfield
   */
  private theirBitField: Uint8Array | undefined;

  /**
   * Waits for handshake or returns peer id if already got one
   * @returns their peer id
   */
  public async getOtherPeerID(): Promise<string> {
    return new Promise((res) => {
      let otherPeer = this.theirPeerID;
      if (otherPeer !== undefined) {
        res(toHex(otherPeer));
      }
      this.once("handshake", (data: Uint8Array) => {
        res(toHex(data));
      });
    });
  }
  public async getBitfield(): Promise<Uint8Array> {
    return new Promise((res) => {
      if (this.theirBitField) {
        return this.theirBitField;
      }
      this.once("bitfield", res);
    });
  }
  public async waitForUnchoke(): Promise<void> {
    return new Promise((res) => {
      this.once("unchoke", res);
    });
  }
  private partialMessage: Uint8Array | null = null;

  private onData(data: Uint8Array) {
    if (this.theirPeerID === undefined) {
      this.theirPeerID = data.subarray(48, 68);
      console.error(
        "<<< Handshake completed, peer id:" + toHex(this.theirPeerID)
      );
      this.emit("handshake", this.theirPeerID);
      return;
    }

    if (this.partialMessage) {
      data = concat(this.partialMessage, data);
      this.partialMessage = null;
    }

    let result: ReturnType<typeof decodePeerMessage>;
    try {
      result = decodePeerMessage(data);
    } catch (x) {
      if (x instanceof NotEnoughDataError) {
        this.partialMessage = data;
      }
      return;
    }
    const { peerMessage, rest } = result;
    this.partialMessage = rest;
    console.error();
    console.error(`<<< ` + peerMessageToString(peerMessage, "them"));
    console.error(`    first 64 bytes of ${data.length}):`);
    console.error(toHex(data.slice(0, 64), 1, 4));

    if (peerMessage.type === "bitfield") {
      this.emit("bitfield", peerMessage.payload);
      this.theirBitField = peerMessage.payload;
      return;
    } else if (peerMessage.type === "unchoke") {
      this.emit("unchoke");
    } else if (peerMessage.type === "piece") {
      this.emit("piece", peerMessage);
    } else {
      this.emit("message", peerMessage);
    }
  }
  public close() {
    this.connection.end();
  }
  public async send(pm: PeerMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connection.closed) {
        reject("cant send message to closed socket");
        return;
      }
      const encoded = encodePeerMessage(pm);
      console.error();
      console.error(`>>> ` + peerMessageToString(pm, "us"));
      // console.error(toHex(encoded, 1, 4));
      this.connection.write(encoded, (err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }
  public async sendInterested(): Promise<void> {
    return await this.send({ type: "interested" });
  }
  public async sendRequest(
    index: number,
    begin: number,
    length: number
  ): Promise<PeerMessageRequest> {
    const pm: PeerMessageRequest = {
      type: "request",
      index,
      begin,
      length,
    };
    await this.send(pm);
    return pm;
  }

  public async waitForPiece(requestMsg: {
    index: number;
    begin: number;
    length: number;
  }): Promise<Uint8Array> {
    return new Promise((res) => {
      const onPiece = (pm: PeerMessagePiece) => {
        if (
          pm.index === requestMsg.index &&
          pm.begin === requestMsg.begin &&
          pm.block.length === requestMsg.length
        ) {
          this.removeListener("piece", onPiece);
          res(pm.block);
        }
      };
      this.on("piece", onPiece);
    });
  }

  public async downloadPiece(pieceIndex: number): Promise<Uint8Array> {
    const metrics = getMetrics(this.torrent, pieceIndex);
    const pieceBuffer = Buffer.alloc(metrics.currentPieceLengthBytes);
    const manager = new PartedDownloadManager(metrics.currentPieceBlockCount);

    while (true) {
      const blockIndex = manager.getAnyItem();

      if (blockIndex === null) {
        break;
      }
      const numberBlocksToDownload = metrics.currentPieceBlockCount;

      const isLastBlock = blockIndex == numberBlocksToDownload - 1;
      const request = await this.sendRequest(
        pieceIndex,
        blockIndex * BLOCK_LENGTH,
        isLastBlock ? metrics.lastBlockLength : BLOCK_LENGTH
      );
      const block = await this.waitForPiece(request);
      console.log("Obtained block length", block.length);
      const buf = Buffer.from(block);
      const copiedBytes = buf.copy(pieceBuffer, request.begin);
      if (copiedBytes !== buf.length) {
        throw new Error(`copied ${copiedBytes} instead of ${buf.length}`);
      }
      manager.completeItem(blockIndex);
    }
    return pieceBuffer;
  }
  constructor(private torrent: TorrentFile, peerAddress: AddressInfo) {
    super();
    this.connection = net.createConnection(
      peerAddress.port,
      peerAddress.address,
      () => {
        console.error("contacting peer", peerAddress);
        // Send data to the server after the connection is established
        this.connection.write(Uint8Array.from([19]));
        this.connection.write(toUint8Array("BitTorrent protocol"));
        this.connection.write(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
        this.connection.write(infoHash(torrent));
        this.connection.write(this.ourPeerID);
      }
    );
    this.connection.on("data", (data) => {
      this.onData(data);
    });
    this.connection.on("end", () => {
      console.error("Disconnected from the server");
    });

    this.connection.on("error", (err) => {
      console.error("Connection error: " + err);
    });
  }
}
