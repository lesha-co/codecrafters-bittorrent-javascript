"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infoTorrent = exports.parseTorrent = void 0;
const node_fs_1 = require("node:fs");
const decode_1 = require("./decode");
const model_1 = require("./model");
function parseTorrent(filename) {
    const data = (0, node_fs_1.readFileSync)(filename);
    const dict = (0, decode_1.decode)(data, false);
    const _dict = (0, model_1.ensureDict)(dict);
    const _dict_info = (0, model_1.ensureDict)(_dict.info);
    return {
        announce: (0, model_1.ensureString)(_dict.announce),
        info: {
            "piece length": (0, model_1.ensureInteger)(_dict_info["piece length"]),
            length: (0, model_1.ensureInteger)(_dict_info.length),
            name: (0, model_1.ensureString)(_dict_info.name),
            pieces: (0, model_1.ensureBuffer)(_dict_info.pieces),
        },
    };
}
exports.parseTorrent = parseTorrent;
function infoTorrent(torrent) {
    const { announce, info } = torrent;
    console.log(`Tracker URL: ${announce}`);
    console.log(`Length: ${info.length}`);
    const hex = (0, model_1.infoHash)(torrent).toString("hex");
    console.log(`Info Hash: ${hex}`);
    console.log(`Piece Length: ${info["piece length"]}`);
    console.log("Piece Hashes:");
    const pieces = info.pieces;
    const nPieces = pieces.length / 20;
    for (let piece = 0; piece < nPieces; piece++) {
        console.log(pieces.subarray(piece * 20, (piece + 1) * 20).toString("hex"));
    }
}
exports.infoTorrent = infoTorrent;
//# sourceMappingURL=info.js.map