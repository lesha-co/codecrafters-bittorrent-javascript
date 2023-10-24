"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._main = void 0;
const decode_1 = require("./decode");
const getPeers_1 = require("./getPeers");
const info_1 = require("./info");
const fs = __importStar(require("node:fs"));
const model_1 = require("./model");
const getPeerInfo_1 = require("./getPeerInfo");
async function _main(command, argument, argument2) {
    if (command === "decode") {
        return JSON.stringify((0, model_1.stringifyBuffers)((0, decode_1.decode)((0, model_1.toBuffer)(argument))));
    }
    if (command === "info") {
        return (0, info_1.infoTorrent)((0, info_1.parseTorrent)(argument));
    }
    if (command === "peers") {
        const peers = await (0, getPeers_1.getPeers)((0, info_1.parseTorrent)(argument));
        return peers.join("\n");
    }
    if (command === "handshake" && argument2) {
        const peer = await (0, getPeerInfo_1.getPeerInfo)(await (0, info_1.parseTorrent)(argument), model_1.AddressInfo.fromString(argument2));
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
exports._main = _main;
//# sourceMappingURL=_main.js.map