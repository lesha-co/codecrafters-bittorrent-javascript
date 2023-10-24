import { AddressInfo, BittorrentPeer, TorrentFile } from "./model";

export async function getPeerInfo(
  torrent: TorrentFile,
  peerAddress: AddressInfo
): Promise<BittorrentPeer> {
  return { id: "0" };
}
