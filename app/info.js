"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infoTorrent = void 0;
const node_fs_1 = require("node:fs");
const decode_1 = require("./decode");
const model_1 = require("./model");
const encode_1 = require("./encode");
const crypto = require("node:crypto");
function parseTorrent(filename) {
    const data = (0, node_fs_1.readFileSync)(filename);
    const dict = (0, decode_1.decode)(data, false);
    const _dict = (0, model_1.ensuredict)(dict);
    const _dict_info = (0, model_1.ensuredict)(_dict.info);
    return {
        announce: (0, model_1.ensurebuffer)(_dict.announce).toString("ascii"),
        info: {
            "piece length": (0, model_1.ensureinteger)(_dict_info["piece length"]),
            length: (0, model_1.ensureinteger)(_dict_info.length),
            name: (0, model_1.ensurebuffer)(_dict_info.name).toString("ascii"),
            pieces: (0, model_1.ensurebuffer)(_dict_info.pieces),
        },
    };
}
function infoTorrent(filename) {
    const { announce, info } = parseTorrent(filename);
    console.log(`Tracker URL: ${announce}`);
    console.log(`Length: ${info.length}`);
    const bencodedInfo = (0, encode_1.encode)(info);
    const shasum = crypto.createHash("sha1");
    shasum.update(bencodedInfo);
    const hex = shasum.digest("hex");
    console.log(`Info Hash: ${hex}`);
}
exports.infoTorrent = infoTorrent;
//# sourceMappingURL=info.js.map