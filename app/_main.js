"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._main = void 0;
const decode_1 = require("./decode");
const getPeers_1 = require("./getPeers");
const info_1 = require("./info");
const model_1 = require("./model");
const getPeerInfo_1 = require("./getPeerInfo");
const compat_1 = require("./compat");
const downloadPiece_1 = require("./downloadPiece");
async function _main(command, argv) {
    if (command === "decode") {
        return JSON.stringify((0, model_1.stringifyBuffers)((0, decode_1.decode)((0, compat_1.toUint8Array)(argv[0]))));
    }
    if (command === "info") {
        return (0, info_1.infoTorrent)(await (0, info_1.parseTorrent)(argv[0]));
    }
    if (command === "peers") {
        const peers = await (0, getPeers_1.getPeers)(await (0, info_1.parseTorrent)(argv[0]));
        return peers.join("\n");
    }
    if (command === "handshake" && argv[1]) {
        const peer = new getPeerInfo_1.PeerAgent(await (0, info_1.parseTorrent)(argv[0]), model_1.AddressInfo.fromString(argv[1]));
        const peerIDHex = await peer.getOtherPeerID();
        return `Peer ID: ${peerIDHex}`;
    }
    if (command === "download_piece") {
        const [_, outfile, tor, index] = argv;
        return await (0, downloadPiece_1.downloadPiece)(outfile, await (0, info_1.parseTorrent)(tor), parseInt(index));
    }
    console.error(`Unknown command ${command}`);
    throw new Error(`Unknown command ${command}`);
}
exports._main = _main;
//# sourceMappingURL=_main.js.map