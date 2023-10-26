import fs from "node:fs/promises";
import { PeerAgent } from "./PeerAgent";
import { TorrentFile } from "./TorrentFile";
import { getPeers } from "./getPeers";

export async function downloadPiece(
  outfile: string,
  torrentFilename: string,
  index: string
) {
  const torrent = await TorrentFile.fromFilename(torrentFilename);
  const peers = await getPeers(torrent);
  const peer = peers[0];
  const peerAgent = new PeerAgent(torrent, peer);
  await peerAgent.connect();
  const piece = await _downloadPiece(peerAgent, parseInt(index));
  await fs.writeFile(outfile, piece);
  await peerAgent.close();
  return `Piece ${index} downloaded to ${outfile}`;
}

export async function _downloadPiece(
  peerAgent: PeerAgent,
  pieceIndex: number
): Promise<Uint8Array> {
  await peerAgent.getBitfield();
  await peerAgent.sendInterested();
  await peerAgent.waitForUnchoke();
  const piece = await peerAgent.downloadPiece(pieceIndex);
  return piece;
}
