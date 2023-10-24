import { decode } from "./decode";
import { getPeers } from "./getPeers";
import { infoTorrent, parseTorrent } from "./info";
import * as fs from "node:fs";
import { AddressInfo, stringifyBuffers, toBuffer } from "./model";
import { getPeerInfo } from "./getPeerInfo";

export async function _main(
  command: string,
  argument: string,
  argument2?: string
): Promise<string> {
  if (command === "decode") {
    return JSON.stringify(stringifyBuffers(decode(toBuffer(argument))));
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
  if (command === "save" && argument2) {
    const b = Buffer.from(argument, "hex");
    fs.writeFileSync(argument2, b);
    return "";
  }
  console.error(`Unknown command ${command}`);
  throw new Error(`Unknown command ${command}`);
}
