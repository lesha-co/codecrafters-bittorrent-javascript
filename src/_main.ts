import { decode } from "./decode";
import { getPeers } from "./getPeers";
import { infoTorrent, parseTorrent } from "./info";
import { AddressInfo, stringifyBuffers } from "./model";
import { PeerAgent } from "./PeerAgent";
import { toUint8Array } from "./compat";
import { downloadPiece } from "./downloadPiece";

export async function _main(command: string, argv: string[]): Promise<string> {
  if (command === "decode") {
    return JSON.stringify(stringifyBuffers(decode(toUint8Array(argv[0]))));
  }
  if (command === "info") {
    return infoTorrent(await parseTorrent(argv[0]));
  }
  if (command === "peers") {
    const peers = await getPeers(await parseTorrent(argv[0]));
    return peers.join("\n");
  }
  if (command === "handshake" && argv[1]) {
    const peer = new PeerAgent(
      await parseTorrent(argv[0]),
      AddressInfo.fromString(argv[1])
    );
    const peerIDHex = await peer.getOtherPeerID();

    return `Peer ID: ${peerIDHex}`;
  }
  if (command === "download_piece") {
    const [_, outfile, tor, index] = argv;
    return await downloadPiece(
      outfile,
      await parseTorrent(tor),
      parseInt(index)
    );
  }
  console.error(`Unknown command ${command}`);
  throw new Error(`Unknown command ${command}`);
}
