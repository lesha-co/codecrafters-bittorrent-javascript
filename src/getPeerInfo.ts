import net from "node:net";
import { AddressInfo, TorrentFile, infoHash } from "./model";
import { toHex, toUint8Array } from "./compat";
import EventEmitter from "node:events";
import { PeerMessage, parsePeerMessage } from "./peerMessage";

export class PeerAgent extends EventEmitter {
  private connection: net.Socket;
  private peerID = new Uint8Array(20).map((x) =>
    Math.round(Math.random() * 256)
  );
  private messages: PeerMessage[] = [];
  private handshakeReceived = false;
  private otherPeerID: Uint8Array | undefined = undefined;

  public async getOtherPeerID(): Promise<string> {
    return new Promise((res) => {
      let otherPeer = this.otherPeerID;
      if (otherPeer !== undefined) {
        res(toHex(otherPeer));
      }
      this.once("handshake", (data: Uint8Array) => {
        res(toHex(data));
      });
    });
  }
  private onData(data: Uint8Array) {
    if (!this.handshakeReceived) {
      this.handshakeReceived = true;
      this.otherPeerID = data.subarray(48, 68);
      this.emit("handshake", this.otherPeerID);
      return;
    }
    const pm = parsePeerMessage(data);
    console.error("from peer: " + JSON.stringify(pm));
    this.messages.push(pm);
  }
  public close() {
    this.connection.end();
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
        this.connection.write(this.peerID);
      }
    );
    this.connection.on("data", (data) => {
      this.onData(data);
    });
  }
}
