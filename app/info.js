"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infoTorrent = void 0;
const compat_1 = require("./compat");
function infoTorrent(torrent) {
    const output = [];
    output.push(`Tracker URL: ${torrent.announce}`);
    output.push(`Length: ${torrent.metrics.file.bytes}`);
    const hex = (0, compat_1.toHex)(torrent.infoHash());
    output.push(`Info Hash: ${hex}`);
    output.push(`Piece Length: ${torrent.pieceLength}`);
    output.push("Piece Hashes:");
    const pieces = torrent.pieces;
    const nPieces = pieces.length / 20;
    for (let piece = 0; piece < nPieces; piece++) {
        output.push((0, compat_1.toHex)(pieces.subarray(piece * 20, (piece + 1) * 20)));
    }
    return output.join("\n");
}
exports.infoTorrent = infoTorrent;
//# sourceMappingURL=info.js.map