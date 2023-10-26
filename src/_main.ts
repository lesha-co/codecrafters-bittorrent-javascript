import { decode } from "./decode";
import { getPeers } from "./getPeers";
import { infoTorrent } from "./info";
import { AddressInfo, stringifyBuffers } from "./model";
import { PeerAgent } from "./PeerAgent";
import { toUint8Array } from "./compat";
import { _downloadPiece, downloadPiece } from "./downloadPiece";
import { downloadFile } from "./downloadFile";
import { TorrentFile } from "./TorrentFile";
import fs from "node:fs/promises";
export async function _main(command: string, argv: string[]): Promise<string> {
  if (command === "decode") {
    return JSON.stringify(stringifyBuffers(decode(toUint8Array(argv[0]))));
  }
  if (command === "info") {
    return infoTorrent(await TorrentFile.fromFilename(argv[0]));
  }
  if (command === "peers") {
    const peers = await getPeers(await TorrentFile.fromFilename(argv[0]));
    return peers.join("\n");
  }
  if (command === "handshake" && argv[1]) {
    const peer = new PeerAgent(
      await TorrentFile.fromFilename(argv[0]),
      AddressInfo.fromString(argv[1])
    );
    await peer.connect();
    return `Peer ID: ${await peer.getOtherPeerID()}`;
  }
  if (command === "download_piece") {
    const [_, outfile, torrentFilename, index] = argv;
    return await downloadPiece(outfile, torrentFilename, index);
  }
  if (command === "download") {
    const [_, outfile, tor] = argv;
    return await downloadFile(outfile, tor);
  }
  console.error(`Unknown command ${command}`);
  throw new Error(`Unknown command ${command}`);
}
