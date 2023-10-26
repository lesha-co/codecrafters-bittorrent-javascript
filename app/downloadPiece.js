"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._downloadPiece = exports.downloadPiece = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const PeerAgent_1 = require("./PeerAgent");
const TorrentFile_1 = require("./TorrentFile");
const getPeers_1 = require("./getPeers");
async function downloadPiece(outfile, torrentFilename, index) {
    const torrent = await TorrentFile_1.TorrentFile.fromFilename(torrentFilename);
    const peers = await (0, getPeers_1.getPeers)(torrent);
    const peer = peers[0];
    const peerAgent = new PeerAgent_1.PeerAgent(torrent, peer);
    await peerAgent.connect();
    const piece = await _downloadPiece(peerAgent, parseInt(index));
    await promises_1.default.writeFile(outfile, piece);
    await peerAgent.close();
    return `Piece ${index} downloaded to ${outfile}`;
}
exports.downloadPiece = downloadPiece;
async function _downloadPiece(peerAgent, pieceIndex) {
    await peerAgent.getBitfield();
    await peerAgent.sendInterested();
    await peerAgent.waitForUnchoke();
    const piece = await peerAgent.downloadPiece(pieceIndex);
    return piece;
}
exports._downloadPiece = _downloadPiece;
//# sourceMappingURL=downloadPiece.js.map