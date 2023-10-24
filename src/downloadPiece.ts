import { PeerAgent } from "./getPeerInfo";
import { getPeers } from "./getPeers";
import { TorrentFile } from "./model";

export async function downloadPiece(
  outputFile: string,
  torrent: TorrentFile,
  index: number
): Promise<string> {
  const peers = await getPeers(torrent);
  const peer = peers[0];
  const peerAgent = new PeerAgent(torrent, peer);

  return "";
}
