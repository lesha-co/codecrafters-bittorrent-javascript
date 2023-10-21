"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decode_1 = require("./decode");
function main() {
    const command = process.argv[2];
    // You can use print statements as follows for debugging, they'll be visible when running tests.
    // console.log("Logs from your program will appear here!");
    // Uncomment this block to pass the first stage
    if (command === "decode") {
        const bencodedValue = process.argv[3];
        // In JavaScript, there's no need to manually convert bytes to string for printing
        // because JS doesn't distinguish between bytes and strings in the same way Python does.
        console.log(JSON.stringify((0, decode_1.decodeBencode)(bencodedValue)));
    }
    else {
        throw new Error(`Unknown command ${command}`);
    }
}
main();
//# sourceMappingURL=main.js.map