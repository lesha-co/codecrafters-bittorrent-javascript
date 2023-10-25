import net from "node:net";
import { AddressInfo, TorrentFile, infoHash } from "./model";
import { toHex, toUint8Array } from "./compat";
import EventEmitter from "node:events";
import {
  PeerMessage,
  decodePeerMessage,
  encodePeerMessage,
} from "./peerMessage";

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
   * An array to store messages for debugging
   */
  private messages: PeerMessage[] = [];
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

      this.once("bitfield", (data: Uint8Array) => {
        res(data);
      });
    });
  }
  private onData(data: Uint8Array) {
    if (this.theirPeerID === undefined) {
      this.theirPeerID = data.subarray(48, 68);
      this.emit("handshake", this.theirPeerID);
      return;
    }

    const pm = decodePeerMessage(data);
    if (pm.type === "bitfield") {
      this.theirBitField = pm.payload;
      this.emit("bitfield", this.theirBitField);
      return;
    }
    console.error("Received (hex) " + toHex(data));
    console.error("        (text) " + JSON.stringify(pm));
    this.messages.push(pm);
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
      console.error(`Sending (text): ` + JSON.stringify(pm));
      console.error(`         (hex): ` + toHex(encoded));
      this.connection.write(encoded, (err) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }
  constructor(torrent: TorrentFile, peerAddress: AddressInfo) {
    super();
    this.connection = net.createConnection(
      peerAddress.port,
      peerAddress.address,
      () => {
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
  }
}
