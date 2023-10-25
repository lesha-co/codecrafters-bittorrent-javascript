import fs from "node:fs/promises";
import { PeerAgent } from "./PeerAgent";
import { getPeers } from "./getPeers";
import { TorrentFile } from "./model";
export async function downloadPiece(
  outputFile: string,
  torrent: TorrentFile,
  pieceIndex: number
): Promise<string> {
  const peers = await getPeers(torrent);
  const peer = peers[0];
  const peerAgent = new PeerAgent(torrent, peer);
  await peerAgent.getBitfield();
  await peerAgent.sendInterested();
  await peerAgent.waitForUnchoke();
  const piece = await peerAgent.downloadPiece(pieceIndex);
  peerAgent.close();
  await fs.writeFile(outputFile, piece);
  return `Piece ${pieceIndex} downloaded to ${outputFile}`;
}
