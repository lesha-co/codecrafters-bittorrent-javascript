"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTorrent = void 0;
const node_fs_1 = require("node:fs");
const decode_1 = require("./decode");
function parseTorrent(filename) {
    const buf = (0, node_fs_1.readFileSync)(filename);
    const data = buf.toString("utf8");
    const dict = (0, decode_1.decodeBencode)(data);
    return dict;
}
exports.parseTorrent = parseTorrent;
//# sourceMappingURL=info.js.map