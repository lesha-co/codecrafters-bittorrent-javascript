"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infoTorrent = exports.parseTorrent = void 0;
const node_fs_1 = require("node:fs");
const decode_1 = require("./decode");
const model_1 = require("./model");
const compat_1 = require("./compat");
function parseTorrent(filename) {
    const data = (0, node_fs_1.readFileSync)(filename);
    const decodedData = (0, decode_1.decode)(data);
    const _dict = (0, model_1.ensureDict)(decodedData);
    const _dict_info = (0, model_1.ensureDict)(_dict.info);
    return {
        announce: (0, compat_1.toString)((0, model_1.ensureU8A)(_dict.announce)),
        info: {
            "piece length": (0, model_1.ensureInteger)(_dict_info["piece length"]),
            length: (0, model_1.ensureInteger)(_dict_info.length),
            name: (0, compat_1.toString)((0, model_1.ensureU8A)(_dict_info.name)),
            pieces: (0, model_1.ensureU8A)(_dict_info.pieces),
        },
    };
}
exports.parseTorrent = parseTorrent;
function infoTorrent(torrent) {
    const { announce, info } = torrent;
    const output = [];
    output.push(`Tracker URL: ${announce}`);
    output.push(`Length: ${info.length}`);
    const hex = (0, compat_1.toHex)((0, model_1.infoHash)(torrent));
    output.push(`Info Hash: ${hex}`);
    output.push(`Piece Length: ${info["piece length"]}`);
    output.push("Piece Hashes:");
    const pieces = info.pieces;
    const nPieces = pieces.length / 20;
    for (let piece = 0; piece < nPieces; piece++) {
        output.push((0, compat_1.toHex)(pieces.subarray(piece * 20, (piece + 1) * 20)));
    }
    return output.join("\n");
}
exports.infoTorrent = infoTorrent;
//# sourceMappingURL=info.js.map