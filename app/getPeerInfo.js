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
    /**
     * Our peer id
     */
    ourPeerID = new Uint8Array(20).map((x) => Math.round(Math.random() * 256));
    /**
     * has value if other peer responded to handshake
     */
    theirPeerID = undefined;
    /**
     * An array to store messages for debugging
     */
    messages = [];
    /**
     * has value if peer sent their bitfield
     */
    theirBitField;
    /**
     * Waits for handshake or returns peer id if already got one
     * @returns their peer id
     */
    async getOtherPeerID() {
        return new Promise((res) => {
            let otherPeer = this.theirPeerID;
            if (otherPeer !== undefined) {
                res((0, compat_1.toHex)(otherPeer));
            }
            this.once("handshake", (data) => {
                res((0, compat_1.toHex)(data));
            });
        });
    }
    async getBitfield() {
        return new Promise((res) => {
            if (this.theirBitField) {
                return this.theirBitField;
            }
            this.once("bitfield", (data) => {
                res(data);
            });
        });
    }
    onData(data) {
        if (this.theirPeerID === undefined) {
            this.theirPeerID = data.subarray(48, 68);
            this.emit("handshake", this.theirPeerID);
            return;
        }
        const pm = (0, peerMessage_1.decodePeerMessage)(data);
        if (pm.type === "bitfield") {
            this.theirBitField = pm.payload;
            this.emit("bitfield", this.theirBitField);
            return;
        }
        console.error("Received (hex) " + (0, compat_1.toHex)(data));
        console.error("        (text) " + JSON.stringify(pm));
        this.messages.push(pm);
    }
    close() {
        this.connection.end();
    }
    async send(pm) {
        return new Promise((resolve, reject) => {
            if (this.connection.closed) {
                reject("cant send message to closed socket");
                return;
            }
            const encoded = (0, peerMessage_1.encodePeerMessage)(pm);
            console.error(`Sending (text): ` + JSON.stringify(pm));
            console.error(`         (hex): ` + (0, compat_1.toHex)(encoded));
            this.connection.write(encoded, (err) => {
                if (err) {
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    }
    constructor(torrent, peerAddress) {
        super();
        this.connection = node_net_1.default.createConnection(peerAddress.port, peerAddress.address, () => {
            // Send data to the server after the connection is established
            this.connection.write(Uint8Array.from([19]));
            this.connection.write((0, compat_1.toUint8Array)("BitTorrent protocol"));
            this.connection.write(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
            this.connection.write((0, model_1.infoHash)(torrent));
            this.connection.write(this.ourPeerID);
        });
        this.connection.on("data", (data) => {
            this.onData(data);
        });
    }
}
exports.PeerAgent = PeerAgent;
//# sourceMappingURL=getPeerInfo.js.map