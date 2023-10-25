import { toHex } from "./compat";
import { PeerAgent } from "./getPeerInfo";
import { getPeers } from "./getPeers";
import { TorrentFile } from "./model";

const BLOCK_LENGTH = 2 ** 14;

export async function downloadPiece(
  outputFile: string,
  torrent: TorrentFile,
  pieceIndex: number
): Promise<string> {
  return new Promise(async (res) => {
    const peers = await getPeers(torrent);
    console.error(`got ${peers.length} peer(s)`);
    const peer = peers[0];
    const peerAgent = new PeerAgent(torrent, peer);
    const bf = await peerAgent.getBitfield();
    console.error(`got bitfield ${toHex(bf)}`);
    // f    f    c    0
    // 1111 1111 1100 0000
    // 10 parts

    // number of bytes we need to download
    const metrics = getMetrics(torrent, pieceIndex);

    console.error(JSON.stringify(metrics, null, 2));
    const numberBlocksToDownload = metrics.currentPieceBlockCount;
    for (
      let blockIndex = 0;
      blockIndex < numberBlocksToDownload;
      blockIndex++
    ) {
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
function getMetrics(torrent: TorrentFile, pieceIndex: number) {
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
