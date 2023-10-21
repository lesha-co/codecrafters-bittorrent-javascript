"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decode_1 = require("./decode");
const info_1 = require("./info");
function main() {
    const command = process.argv[2];
    switch (command) {
        case "decode": {
            const bencodedValue = process.argv[3];
            console.log(JSON.stringify((0, decode_1.decodeBencode)(bencodedValue)));
            return;
        }
        case "info": {
            const torrent = (0, info_1.parseTorrent)(process.argv[3]);
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
//# sourceMappingURL=main.js.map