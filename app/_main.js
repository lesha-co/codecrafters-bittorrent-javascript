"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._main = void 0;
const decode_1 = require("./decode");
const getPeers_1 = require("./getPeers");
const info_1 = require("./info");
const model_1 = require("./model");
const getPeerInfo_1 = require("./getPeerInfo");
const compat_1 = require("./compat");
async function _main(command, argument, argument2) {
    if (command === "decode") {
        return JSON.stringify((0, model_1.stringifyBuffers)((0, decode_1.decode)((0, compat_1.toUint8Array)(argument))));
    }
    if (command === "info") {
        return (0, info_1.infoTorrent)((0, info_1.parseTorrent)(argument));
    }
    if (command === "peers") {
        const peers = await (0, getPeers_1.getPeers)((0, info_1.parseTorrent)(argument));
        return peers.join("\n");
    }
    if (command === "handshake" && argument2) {
        const peer = await (0, getPeerInfo_1.getPeerInfo)(await (0, info_1.parseTorrent)(argument), model_1.AddressInfo.fromString(argument2));
        return `Peer ID: ${peer.id}`;
    }
    console.error(`Unknown command ${command}`);
    throw new Error(`Unknown command ${command}`);
}
exports._main = _main;
//# sourceMappingURL=_main.js.map