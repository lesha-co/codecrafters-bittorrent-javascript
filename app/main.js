"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decode_1 = require("./decode");
const getPeers_1 = require("./getPeers");
const info_1 = require("./info");
const fs = require("node:fs");
async function main() {
    const command = process.argv[2];
    const argument = process.argv[3];
    const argument2 = process.argv[4];
    if (command === "decode") {
        console.log(JSON.stringify((0, decode_1.decode)(Buffer.from(argument, "ascii"), true)));
    }
    else if (command === "info") {
        (0, info_1.infoTorrent)((0, info_1.parseTorrent)(argument));
    }
    else if (command === "peers") {
        const peers = await (0, getPeers_1.getPeers)((0, info_1.parseTorrent)(argument));
        for (const peer of peers) {
            console.log(peer);
        }
    }
    else if (command === "save") {
        const b = Buffer.from(argument, "hex");
        fs.writeFileSync(argument2, b);
    }
    else {
        throw new Error(`Unknown command ${command}`);
    }
}
main();
//# sourceMappingURL=main.js.map