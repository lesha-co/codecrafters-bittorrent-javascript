"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decode_1 = require("./decode");
const info_1 = require("./info");
const fs = require("node:fs");
function main() {
    const command = process.argv[2];
    if (command === "decode") {
        const bencodedValue = process.argv[3];
        console.log(JSON.stringify((0, decode_1.decode)(Buffer.from(bencodedValue, "ascii"), true)));
    }
    else if (command === "info") {
        (0, info_1.infoTorrent)(process.argv[3]);
    }
    else if (command === "save") {
        const b = Buffer.from(process.argv[3], "hex");
        fs.writeFileSync(process.argv[4], b);
    }
    else {
        throw new Error(`Unknown command ${command}`);
    }
}
main();
//# sourceMappingURL=main.js.map