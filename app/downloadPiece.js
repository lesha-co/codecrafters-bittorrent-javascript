"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPiece = void 0;
const compat_1 = require("./compat");
const getPeerInfo_1 = require("./getPeerInfo");
const getPeers_1 = require("./getPeers");
const BLOCK_LENGTH = 2 ** 14;
async function downloadPiece(outputFile, torrent, pieceIndex) {
    return new Promise(async (res) => {
        const peers = await (0, getPeers_1.getPeers)(torrent);
        console.error(`got ${peers.length} peer(s)`);
        const peer = peers[0];
        const peerAgent = new getPeerInfo_1.PeerAgent(torrent, peer);
        const bf = await peerAgent.getBitfield();
        console.error(`got bitfield ${(0, compat_1.toHex)(bf)}`);
        // f    f    c    0
        // 1111 1111 1100 0000
        // 10 parts
        // number of bytes we need to download
        const metrics = getMetrics(torrent, pieceIndex);
        console.error(JSON.stringify(metrics, null, 2));
        const numberBlocksToDownload = metrics.currentPieceBlockCount;
        for (let blockIndex = 0; blockIndex < numberBlocksToDownload; blockIndex++) {
            const isLastBlock = blockIndex == numberBlocksToDownload - 1;
            await peerAgent.send({
                type: "request",
                index: pieceIndex,
                begin: blockIndex * BLOCK_LENGTH,
                length: isLastBlock ? metrics.lastBlockLength : BLOCK_LENGTH,
            });
        }
        return "";
    });
}
exports.downloadPiece = downloadPiece;
function getMetrics(torrent, pieceIndex) {
    const totalFileLength = torrent.info.length;
    // file is divided into PIECES, each this long
    const pieceLength = torrent.info["piece length"];
    // we need download this many pieces, last one will be smaller
    const pieceCount = Math.ceil(totalFileLength / pieceLength);
    // this is how long the last piece is
    const lastPieceLenthBytes = totalFileLength % pieceLength;
    // is this piece the last?
    const isLastPiece = pieceIndex === pieceCount - 1;
    // then, each piece is divided in blocks, this many:
    const regularPieceBlockCount = pieceLength / BLOCK_LENGTH;
    // since last piece is smaller, it has different number of blocks
    const lastPieceBlockCount = Math.ceil(lastPieceLenthBytes / BLOCK_LENGTH);
    // also last block is smaller
    const lastBlockLength = lastPieceLenthBytes % BLOCK_LENGTH;
    return {
        totalFileLength,
        pieceLength,
        pieceCount,
        lastPieceLenthBytes,
        regularPieceBlockCount,
        lastPieceBlockCount,
        lastBlockLength,
        currentPieceBlockCount: isLastPiece
            ? lastPieceBlockCount
            : regularPieceBlockCount,
    };
}
//# sourceMappingURL=downloadPiece.js.map