"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerAgent = void 0;
const node_net_1 = __importDefault(require("node:net"));
const model_1 = require("./model");
const compat_1 = require("./compat");
const node_events_1 = __importDefault(require("node:events"));
const peerMessage_1 = require("./peerMessage");
class PeerAgent extends node_events_1.default {
    connection;
    peerID = new Uint8Array(20).map((x) => Math.round(Math.random() * 256));
    messages = [];
    handshakeReceived = false;
    otherPeerID = undefined;
    async getOtherPeerID() {
        return new Promise((res) => {
            let otherPeer = this.otherPeerID;
            if (otherPeer !== undefined) {
                res((0, compat_1.toHex)(otherPeer));
            }
            this.once("handshake", (data) => {
                res((0, compat_1.toHex)(data));
            });
        });
    }
    onData(data) {
        if (!this.handshakeReceived) {
            this.handshakeReceived = true;
            this.otherPeerID = data.subarray(48, 68);
            this.emit("handshake", this.otherPeerID);
            return;
        }
        const pm = (0, peerMessage_1.parsePeerMessage)(data);
        console.error("from peer: " + JSON.stringify(pm));
        this.messages.push(pm);
    }
    close() {
        this.connection.end();
    }
    constructor(torrent, peerAddress) {
        super();
        this.connection = node_net_1.default.createConnection(peerAddress.port, peerAddress.address, () => {
            // Send data to the server after the connection is established
            this.connection.write(Uint8Array.from([19]));
            this.connection.write((0, compat_1.toUint8Array)("BitTorrent protocol"));
            this.connection.write(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
            this.connection.write((0, model_1.infoHash)(torrent));
            this.connection.write(this.peerID);
        });
        this.connection.on("data", (data) => {
            this.onData(data);
        });
    }
}
exports.PeerAgent = PeerAgent;
//# sourceMappingURL=getPeerInfo.js.map