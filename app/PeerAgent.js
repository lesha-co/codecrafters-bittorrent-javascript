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
class PartedDownloadManager {
    items;
    constructor(nItems) {
        this.items = new Array(nItems).fill(false).map((x, i) => i);
    }
    getAnyItem() {
        if (this.items.length === 0) {
            return null;
        }
        const index = Math.round(this.items.length * Math.random()) % this.items.length;
        return this.items[index];
    }
    completeItem(itemIndex) {
        const index = this.items.indexOf(itemIndex);
        if (index == -1) {
            throw new Error("was already completed");
        }
        this.items.splice(index, 1);
    }
}
class PeerAgent extends node_events_1.default {
    torrent;
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
            this.once("bitfield", res);
        });
    }
    async waitForUnchoke() {
        return new Promise((res) => {
            this.once("unchoke", res);
        });
    }
    partialMessage = null;
    onData(data) {
        if (this.theirPeerID === undefined) {
            this.theirPeerID = data.subarray(48, 68);
            console.error("<<< Handshake completed, peer id:" + (0, compat_1.toHex)(this.theirPeerID));
            this.emit("handshake", this.theirPeerID);
            return;
        }
        if (this.partialMessage) {
            data = (0, compat_1.concat)(this.partialMessage, data);
            this.partialMessage = null;
        }
        let result;
        try {
            result = (0, peerMessage_1.decodePeerMessage)(data);
        }
        catch (x) {
            if (x instanceof peerMessage_1.NotEnoughDataError) {
                this.partialMessage = data;
            }
            return;
        }
        const { peerMessage, rest } = result;
        this.partialMessage = rest;
        console.error();
        console.error(`<<< ` + (0, peerMessage_1.peerMessageToString)(peerMessage, "them"));
        // console.error(toHex(data, 1, 4));
        if (peerMessage.type === "bitfield") {
            this.emit("bitfield", peerMessage.payload);
            this.theirBitField = peerMessage.payload;
            return;
        }
        else if (peerMessage.type === "unchoke") {
            this.emit("unchoke");
        }
        else if (peerMessage.type === "piece") {
            this.emit("piece", peerMessage);
        }
        else {
            this.emit("message", peerMessage);
        }
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
            console.error();
            console.error(`>>> ` + (0, peerMessage_1.peerMessageToString)(pm, "us"));
            // console.error(toHex(encoded, 1, 4));
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
    async sendInterested() {
        return await this.send({ type: "interested" });
    }
    async sendRequest(index, begin, length) {
        const pm = {
            type: "request",
            index,
            begin,
            length,
        };
        await this.send(pm);
        return pm;
    }
    async waitForPiece(requestMsg) {
        return new Promise((res) => {
            const onPiece = (pm) => {
                if (pm.index === requestMsg.index &&
                    pm.begin === requestMsg.begin &&
                    pm.block.length === requestMsg.length) {
                    this.removeListener("piece", onPiece);
                    res(pm);
                }
            };
            this.on("piece", onPiece);
        });
    }
    async downloadPiece(pieceIndex) {
        const metrics = (0, model_1.getMetrics)(this.torrent, pieceIndex);
        const pieceBuffer = Buffer.alloc(metrics.currentPieceLengthBytes);
        const manager = new PartedDownloadManager(metrics.currentPieceBlockCount);
        console.log("total piece length", metrics.currentPieceLengthBytes);
        while (true) {
            const blockIndex = manager.getAnyItem();
            if (blockIndex === null) {
                break;
            }
            const numberBlocksToDownload = metrics.currentPieceBlockCount;
            const isLastBlock = blockIndex == numberBlocksToDownload - 1;
            const request = await this.sendRequest(pieceIndex, blockIndex * model_1.BLOCK_LENGTH, isLastBlock ? metrics.lastBlockLength : model_1.BLOCK_LENGTH);
            const pieceMessage = await this.waitForPiece(request);
            const buf = Buffer.from(pieceMessage.block);
            console.error(`copying bytes ${request.begin} - ${request.begin + buf.length} (${buf.length}) `);
            const copiedBytes = buf.copy(pieceBuffer, request.begin);
            if (copiedBytes !== buf.length) {
                throw new Error(`copied ${copiedBytes} instead of ${buf.length}`);
            }
            manager.completeItem(blockIndex);
        }
        return pieceBuffer;
    }
    constructor(torrent, peerAddress) {
        super();
        this.torrent = torrent;
        this.connection = node_net_1.default.createConnection(peerAddress.port, peerAddress.address, () => {
            console.error("contacting peer", peerAddress);
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
        this.connection.on("end", () => {
            console.error("Disconnected from the server");
        });
        this.connection.on("error", (err) => {
            console.error("Connection error: " + err);
        });
    }
}
exports.PeerAgent = PeerAgent;
//# sourceMappingURL=PeerAgent.js.map