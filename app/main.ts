import { decodeBencode } from "./decode";
import { parseTorrent } from "./info";

function main() {
  const command = process.argv[2];

  switch (command) {
    case "decode": {
      const bencodedValue = process.argv[3];
      console.log(JSON.stringify(decodeBencode(bencodedValue)));
      return;
    }
    case "info": {
      const torrent = parseTorrent(process.argv[3]);
      console.log(`Tracker URL: ${torrent.announce}`);
      console.log(`Length: ${torrent.info.length}`);
      return;
    }
    default: {
      throw new Error(`Unknown command ${command}`);
    }
  }
}

main();
