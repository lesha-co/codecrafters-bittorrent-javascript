"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerAgent = void 0;
const node_net_1 = __importDefault(require("node:net"));
const compat_1 = require("./compat");
const node_events_1 = __importDefault(require("node:events"));
const peerMessage_1 = require("./peerMessage");
const PartedDownloadManager_1 = require("./PartedDownloadManager");
class PeerAgent extends node_events_1.default {
    torrent;
    peerAddress;
    connection;
    get isConnected() {
        return this.connection && !this.connection.closed;
    }
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
    get remoteAddress() {
        return this.peerAddress;
    }
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
            // console.error(
            //   `<<< ${this.theirPeerID}  Handshake completed, peer id:` +
            //     toHex(this.theirPeerID)
            // );
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
        // console.error();
        // console.error(
        //   `<<< ${this.theirPeerID} ` + peerMessageToString(peerMessage, "them")
        // );
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
        return new Promise((res) => {
            this.connection?.end(res);
        });
    }
    async send(pm) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject("cant send message to closed socket");
                return;
            }
            const encoded = (0, peerMessage_1.encodePeerMessage)(pm);
            // console.error();
            // console.error(`>>> ${this.theirPeerID} ` + peerMessageToString(pm, "us"));
            // console.error(toHex(encoded, 1, 4));
            this.connection?.write(encoded, (err) => {
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
        const metrics = this.torrent.metrics;
        const pieceMetrics = metrics.piece(pieceIndex);
        const pieceBuffer = Buffer.alloc(pieceMetrics.bytes);
        const manager = new PartedDownloadManager_1.PartedDownloadManager(pieceMetrics.blocks);
        while (manager.hasItem()) {
            const blockIndex = manager.getAnyItem();
            const numberBlocksToDownload = pieceMetrics.blocks;
            const isLastBlock = pieceMetrics.isLast && blockIndex == numberBlocksToDownload - 1;
            const request = await this.sendRequest(pieceIndex, blockIndex * metrics.block.regular.bytes, isLastBlock ? metrics.block.last.bytes : metrics.block.regular.bytes);
            const pieceMessage = await this.waitForPiece(request);
            const buf = Buffer.from(pieceMessage.block);
            const copiedBytes = buf.copy(pieceBuffer, request.begin);
            if (copiedBytes !== buf.length) {
                throw new Error(`copied ${copiedBytes} instead of ${buf.length}`);
            }
        }
        return pieceBuffer;
    }
    connect() {
        return new Promise((resolve) => {
            const connection = node_net_1.default.createConnection(this.peerAddress.port, this.peerAddress.address, () => {
                console.error(`${this.peerAddress} contacting peer`);
            });
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
                connection.write((0, compat_1.toUint8Array)("BitTorrent protocol"));
                connection.write(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
                connection.write(this.torrent.infoHash());
                connection.write(this.ourPeerID);
                this.connection = connection;
                resolve();
            });
        });
    }
    constructor(torrent, peerAddress) {
        super();
        this.torrent = torrent;
        this.peerAddress = peerAddress;
        this.connection = null;
    }
}
exports.PeerAgent = PeerAgent;
//# sourceMappingURL=PeerAgent.js.map