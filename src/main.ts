import { decode } from "./decode";
import { getPeers } from "./getPeers";
import { infoTorrent, parseTorrent } from "./info";
import * as fs from "node:fs";
async function main() {
  const command = process.argv[2];
  const argument = process.argv[3];
  const argument2 = process.argv[4];

  if (command === "decode") {
    console.log(JSON.stringify(decode(Buffer.from(argument, "ascii"), true)));
  } else if (command === "info") {
    infoTorrent(parseTorrent(argument));
  } else if (command === "peers") {
    const peers = await getPeers(parseTorrent(argument));
    for (const peer of peers) {
      console.log(peer);
    }
  } else if (command === "save") {
    const b = Buffer.from(argument, "hex");
    fs.writeFileSync(argument2, b);
  } else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
