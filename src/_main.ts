import { decode } from "./decode";
import { getPeers } from "./getPeers";
import { infoTorrent, parseTorrent } from "./info";
import { AddressInfo, stringifyBuffers } from "./model";
import { getPeerInfo } from "./getPeerInfo";
import { toUint8Array } from "./compat";

export async function _main(
  command: string,
  argument: string,
  argument2?: string
): Promise<string> {
  if (command === "decode") {
    return JSON.stringify(stringifyBuffers(decode(toUint8Array(argument))));
  }
  if (command === "info") {
    return infoTorrent(parseTorrent(argument));
  }
  if (command === "peers") {
    const peers = await getPeers(parseTorrent(argument));
    return peers.join("\n");
  }
  if (command === "handshake" && argument2) {
    const peer = await getPeerInfo(
      await parseTorrent(argument),
      AddressInfo.fromString(argument2)
    );
    return `Peer ID: ${peer.id}`;
  }
  console.error(`Unknown command ${command}`);
  throw new Error(`Unknown command ${command}`);
}
