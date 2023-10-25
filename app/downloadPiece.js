"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPiece = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const PeerAgent_1 = require("./PeerAgent");
const getPeers_1 = require("./getPeers");
async function downloadPiece(outputFile, torrent, pieceIndex) {
    const peers = await (0, getPeers_1.getPeers)(torrent);
    const peer = peers[0];
    const peerAgent = new PeerAgent_1.PeerAgent(torrent, peer);
    await peerAgent.getBitfield();
    await peerAgent.sendInterested();
    await peerAgent.waitForUnchoke();
    const piece = await peerAgent.downloadPiece(pieceIndex);
    peerAgent.close();
    await promises_1.default.writeFile(outputFile, piece);
    return `Piece ${pieceIndex} downloaded to ${outputFile}`;
}
exports.downloadPiece = downloadPiece;
//# sourceMappingURL=downloadPiece.js.map