"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._main = void 0;
const decode_1 = require("./decode");
const getPeers_1 = require("./getPeers");
const info_1 = require("./info");
const model_1 = require("./model");
const PeerAgent_1 = require("./PeerAgent");
const compat_1 = require("./compat");
const downloadPiece_1 = require("./downloadPiece");
const downloadFile_1 = require("./downloadFile");
const TorrentFile_1 = require("./TorrentFile");
async function _main(command, argv) {
    if (command === "decode") {
        return JSON.stringify((0, model_1.stringifyBuffers)((0, decode_1.decode)((0, compat_1.toUint8Array)(argv[0]))));
    }
    if (command === "info") {
        return (0, info_1.infoTorrent)(await TorrentFile_1.TorrentFile.fromFilename(argv[0]));
    }
    if (command === "peers") {
        const peers = await (0, getPeers_1.getPeers)(await TorrentFile_1.TorrentFile.fromFilename(argv[0]));
        return peers.join("\n");
    }
    if (command === "handshake" && argv[1]) {
        const peer = new PeerAgent_1.PeerAgent(await TorrentFile_1.TorrentFile.fromFilename(argv[0]), model_1.AddressInfo.fromString(argv[1]));
        await peer.connect();
        return `Peer ID: ${await peer.getOtherPeerID()}`;
    }
    if (command === "download_piece") {
        const [_, outfile, torrentFilename, index] = argv;
        return await (0, downloadPiece_1.downloadPiece)(outfile, torrentFilename, index);
    }
    if (command === "download") {
        const [_, outfile, tor] = argv;
        return await (0, downloadFile_1.downloadFile)(outfile, tor);
    }
    console.error(`Unknown command ${command}`);
    throw new Error(`Unknown command ${command}`);
}
exports._main = _main;
//# sourceMappingURL=_main.js.map