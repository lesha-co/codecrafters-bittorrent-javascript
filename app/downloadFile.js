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
async function worker(peer, torrent, manager, handle) {
    const peerAgent = new PeerAgent_1.PeerAgent(torrent, peer);
    await peerAgent.getBitfield();
    await peerAgent.sendInterested();
    await peerAgent.waitForUnchoke();
    while (true) {
        const pieceIndex = manager.getAnyItem();
        if (pieceIndex === null)
            break;
        console.error(`[start] piece ${pieceIndex} peer ${peerAgent.remoteAddress}`);
        const piece = await peerAgent.downloadPiece(pieceIndex);
        await handle.write(piece, 0, piece.length, torrent.metrics.piece(pieceIndex).offset);
        console.error(`[finish] piece ${pieceIndex} `);
    }
    peerAgent.close();
}
async function downloadFile(outputFile, torrentFilename) {
    const file = await promises_1.default.open(outputFile, "w");
    const torrent = await TorrentFile_1.TorrentFile.fromFilename(torrentFilename);
    const peers = await (0, getPeers_1.getPeers)(torrent);
    const manager = new PartedDownloadManager_1.PartedDownloadManager(torrent.metrics.file.pieces);
    const workers = peers.map((peer) => worker(peer, torrent, manager, file));
    await Promise.allSettled(workers);
    console.error("all settled");
    await file.close();
    console.error("file closed");
    return `Downloaded ${torrentFilename} to ${outputFile}.`;
}
exports.downloadFile = downloadFile;
//# sourceMappingURL=downloadFile.js.map