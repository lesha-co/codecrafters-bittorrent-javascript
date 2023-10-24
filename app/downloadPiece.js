"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPiece = void 0;
const getPeerInfo_1 = require("./getPeerInfo");
const getPeers_1 = require("./getPeers");
async function downloadPiece(outputFile, torrent, index) {
    const peers = await (0, getPeers_1.getPeers)(torrent);
    const peer = peers[0];
    const peerAgent = new getPeerInfo_1.PeerAgent(torrent, peer);
    return "";
}
exports.downloadPiece = downloadPiece;
//# sourceMappingURL=downloadPiece.js.map