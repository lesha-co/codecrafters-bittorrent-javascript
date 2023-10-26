"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const PeerAgent_1 = require("./PeerAgent");
const getPeers_1 = require("./getPeers");
const TorrentFile_1 = require("./TorrentFile");
const PartedDownloadManager_1 = require("./PartedDownloadManager");
class ResettableTimeout {
    timeout;
    callback;
    timeoutID;
    reset() {
        this.cancel();
        this.start();
    }
    cancel() {
        if (this.timeoutID !== null)
            clearTimeout(this.timeoutID);
    }
    start() {
        this.timeoutID = setTimeout(this.callback, this.timeout);
    }
    constructor(timeout, callback) {
        this.timeout = timeout;
        this.callback = callback;
        this.timeoutID = null;
        this.start();
    }
}
async function worker(peerAgent, torrent, manager, handle, name) {
    async function workerAttempt() {
        return new Promise(async (resolve, reject) => {
            let watchdog = new ResettableTimeout(10000, reject);
            await peerAgent.connect();
            watchdog.reset();
            await peerAgent.getBitfield();
            watchdog.reset();
            await peerAgent.sendInterested();
            watchdog.reset();
            await peerAgent.waitForUnchoke();
            watchdog.reset();
            while (manager.hasItem()) {
                const pieceIndex = manager.getAnyItem();
                const piece = await peerAgent.downloadPiece(pieceIndex);
                await handle.write(piece, 0, piece.length, torrent.metrics.piece(pieceIndex).offset);
                watchdog.reset();
            }
            await peerAgent.close();
            watchdog.cancel();
            resolve();
        });
    }
    while (manager.hasItem()) {
        try {
            await workerAttempt();
        }
        catch { }
    }
}
async function downloadFile(outputFile, torrentFilename) {
    const file = await promises_1.default.open(outputFile, "w");
    const torrent = await TorrentFile_1.TorrentFile.fromFilename(torrentFilename);
    const peers = await (0, getPeers_1.getPeers)(torrent);
    const manager = new PartedDownloadManager_1.PartedDownloadManager(torrent.metrics.file.pieces);
    const workers = peers.map((peer, index) => {
        const agent = new PeerAgent_1.PeerAgent(torrent, peer);
        return worker(agent, torrent, manager, file, `worker-${index}`);
    });
    await Promise.allSettled(workers);
    console.error("all settled");
    await file.close();
    console.error("file closed");
    return `Downloaded ${torrentFilename} to ${outputFile}.`;
}
exports.downloadFile = downloadFile;
//# sourceMappingURL=downloadFile.js.map