import { decode } from "./decode";
import { infoTorrent } from "./info";
import * as fs from "node:fs";
function main() {
  const command = process.argv[2];

  if (command === "decode") {
    const bencodedValue = process.argv[3];
    console.log(
      JSON.stringify(decode(Buffer.from(bencodedValue, "ascii"), true))
    );
  } else if (command === "info") {
    infoTorrent(process.argv[3]);
  } else if (command === "save") {
    const b = Buffer.from(process.argv[3], "hex");
    fs.writeFileSync(process.argv[4], b);
  } else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
