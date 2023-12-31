import net from "node:net";
import { AddressInfo } from "./model";
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
import { TorrentFile } from "./TorrentFile";
import { PartedDownloadManager } from "./PartedDownloadManager";

export class PeerAgent extends EventEmitter {
  private connection: net.Socket | null;
  public get isConnected() {
    return this.connection && !this.connection.closed;
  }
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

  public get remoteAddress() {
    return this.peerAddress;
  }
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
      // console.error(
      //   `<<< ${this.theirPeerID}  Handshake completed, peer id:` +
      //     toHex(this.theirPeerID)
      // );
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
    // console.error();
    // console.error(
    //   `<<< ${this.theirPeerID} ` + peerMessageToString(peerMessage, "them")
    // );

    // console.error(toHex(data, 1, 4));
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
  public close(): Promise<void> {
    return new Promise((res) => {
      this.connection?.end(res);
    });
  }
  public async send(pm: PeerMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject("cant send message to closed socket");
        return;
      }
      const encoded = encodePeerMessage(pm);
      // console.error();
      // console.error(`>>> ${this.theirPeerID} ` + peerMessageToString(pm, "us"));
      // console.error(toHex(encoded, 1, 4));
      this.connection?.write(encoded, (err) => {
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
  }): Promise<PeerMessagePiece> {
    return new Promise((res) => {
      const onPiece = (pm: PeerMessagePiece) => {
        if (
          pm.index === requestMsg.index &&
          pm.begin === requestMsg.begin &&
          pm.block.length === requestMsg.length
        ) {
          this.removeListener("piece", onPiece);
          res(pm);
        }
      };
      this.on("piece", onPiece);
    });
  }

  public async downloadPiece(pieceIndex: number): Promise<Uint8Array> {
    const metrics = this.torrent.metrics;
    const pieceMetrics = metrics.piece(pieceIndex);
    const pieceBuffer = Buffer.alloc(pieceMetrics.bytes);
    const manager = new PartedDownloadManager(pieceMetrics.blocks);
    while (manager.hasItem()) {
      const blockIndex = manager.getAnyItem();

      const numberBlocksToDownload = pieceMetrics.blocks;

      const isLastBlock =
        pieceMetrics.isLast && blockIndex == numberBlocksToDownload - 1;
      const request = await this.sendRequest(
        pieceIndex,
        blockIndex * metrics.block.regular.bytes,
        isLastBlock ? metrics.block.last.bytes : metrics.block.regular.bytes
      );
      const pieceMessage = await this.waitForPiece(request);
      const buf = Buffer.from(pieceMessage.block);
      const copiedBytes = buf.copy(pieceBuffer, request.begin);
      if (copiedBytes !== buf.length) {
        throw new Error(`copied ${copiedBytes} instead of ${buf.length}`);
      }
    }
    return pieceBuffer;
  }

  public connect(): Promise<void> {
    return new Promise((resolve) => {
      const connection = net.createConnection(
        this.peerAddress.port,
        this.peerAddress.address,
        () => {
          console.error(`${this.peerAddress} contacting peer`);
        }
      );
      connection.on("data", (data) => {
        this.onData(data);
      });
      connection.on("end", () => {
        console.error(`${this.peerAddress} Disconnected`);
      });

      connection.on("error", (err) => {
        console.error(`${this.peerAddress} Connection error: ${err}`);
      });

      connection.on("connect", () => {
        console.error(`${this.peerAddress} connected, sending handshake`);
        connection.write(Uint8Array.from([19]));
        connection.write(toUint8Array("BitTorrent protocol"));
        connection.write(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
        connection.write(this.torrent.infoHash());
        connection.write(this.ourPeerID);
        this.connection = connection;
        resolve();
      });
    });
  }
  constructor(private torrent: TorrentFile, private peerAddress: AddressInfo) {
    super();
    this.connection = null;
  }
}
