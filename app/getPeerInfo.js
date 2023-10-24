"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeerInfo = void 0;
const node_net_1 = __importDefault(require("node:net"));
const model_1 = require("./model");
const compat_1 = require("./compat");
async function getPeerInfo(torrent, peerAddress) {
    /**
     *
      length of the protocol string (BitTorrent protocol) which is 19 (1 byte)
      the string BitTorrent protocol (19 bytes)
      eight reserved bytes, which are all set to zero (8 bytes)
      sha1 infohash (20 bytes) (NOT the hexadecimal representation, which is 40 bytes long)
      peer id (20 bytes) (you can use 00112233445566778899 for this challenge)
  
     */
    return new Promise((resolve) => {
        const client = node_net_1.default.createConnection(peerAddress.port, peerAddress.address, () => {
            // Send data to the server after the connection is established
            client.write(Uint8Array.from([19]));
            client.write((0, compat_1.toUint8Array)("BitTorrent protocol"));
            client.write(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
            client.write((0, model_1.infoHash)(torrent));
            client.write((0, compat_1.toUint8Array)("00112233445566778899"));
        });
        // Listen for data from the server
        client.on("data", (data) => {
            const peerID = (0, compat_1.toHex)(data.subarray(48, 68));
            // Close the connection after receiving data (if needed)
            client.end();
            resolve({ id: peerID });
        });
    });
}
exports.getPeerInfo = getPeerInfo;
//# sourceMappingURL=getPeerInfo.js.map