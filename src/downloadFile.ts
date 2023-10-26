import fs from "node:fs/promises";
import { PeerAgent } from "./PeerAgent";
import { getPeers } from "./getPeers";
import { TorrentFile } from "./TorrentFile";
import { AddressInfo } from "./model";
import { PartedDownloadManager } from "./PartedDownloadManager";

async function worker(
  peer: AddressInfo,
  torrent: TorrentFile,
  manager: PartedDownloadManager,
  handle: fs.FileHandle
) {
  const peerAgent = new PeerAgent(torrent, peer);
  await peerAgent.getBitfield();
  await peerAgent.sendInterested();
  await peerAgent.waitForUnchoke();
  while (true) {
    const pieceIndex = manager.getAnyItem();

    if (pieceIndex === null) break;
    console.error(
      `[start] piece ${pieceIndex} peer ${peerAgent.remoteAddress}`
    );
    const piece = await peerAgent.downloadPiece(pieceIndex);
    await handle.write(
      piece,
      0,
      piece.length,
      torrent.metrics.piece(pieceIndex).offset
    );
    console.error(`[finish] piece ${pieceIndex} `);
  }
  peerAgent.close();
}

export async function downloadFile(
  outputFile: string,
  torrentFilename: string
): Promise<string> {
  const file = await fs.open(outputFile, "w");
  const torrent = await TorrentFile.fromFilename(torrentFilename);
  const peers = await getPeers(torrent);

  const manager = new PartedDownloadManager(torrent.metrics.file.pieces);

  const workers = peers.map((peer) => worker(peer, torrent, manager, file));

  await Promise.allSettled(workers);
  console.error("all settled");
  await file.close();
  console.error("file closed");
  return `Downloaded ${torrentFilename} to ${outputFile}.`;
}
