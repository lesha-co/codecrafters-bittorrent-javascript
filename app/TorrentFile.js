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
exports.TorrentFile = void 0;
const promises_1 = require("node:fs/promises");
const encode_1 = require("./encode");
const crypto = __importStar(require("node:crypto"));
const decode_1 = require("./decode");
const model_1 = require("./model");
const compat_1 = require("./compat");
class TorrentFile {
    announce;
    length;
    pieceLength;
    pieces;
    name;
    metrics;
    static async fromFilename(filename) {
        const data = await (0, promises_1.readFile)(filename);
        const decodedData = (0, decode_1.decode)(data);
        const _dict = (0, model_1.ensureDict)(decodedData);
        const _dict_info = (0, model_1.ensureDict)(_dict.info);
        return new TorrentFile((0, compat_1.toString)((0, model_1.ensureU8A)(_dict.announce)), (0, model_1.ensureInteger)(_dict_info.length), (0, model_1.ensureInteger)(_dict_info["piece length"]), (0, model_1.ensureU8A)(_dict_info.pieces), (0, compat_1.toString)((0, model_1.ensureU8A)(_dict_info.name)));
    }
    constructor(announce, length, pieceLength, pieces, name) {
        this.announce = announce;
        this.length = length;
        this.pieceLength = pieceLength;
        this.pieces = pieces;
        this.name = name;
        this.metrics = this.getMetrics();
    }
    infoHash() {
        const bencodedInfo = (0, encode_1.encode)({
            length: this.length,
            name: this.name,
            "piece length": this.pieceLength,
            pieces: this.pieces,
        });
        const shasum = crypto.createHash("sha1");
        shasum.update(bencodedInfo);
        const digest = shasum.digest();
        return digest;
    }
    getMetrics() {
        const BLOCK_LENGTH = 2 ** 14;
        // we need download this many pieces, last one will be smaller
        const pieceCount = Math.ceil(this.length / this.pieceLength);
        // this is how long the last piece is
        const lastPieceLenthBytes = this.length % this.pieceLength;
        // then, each piece is divided in blocks, this many:
        const regularPieceBlockCount = this.pieceLength / BLOCK_LENGTH;
        // since last piece is smaller, it has different number of blocks
        const lastPieceBlockCount = Math.ceil(lastPieceLenthBytes / BLOCK_LENGTH);
        // also last block is smaller
        const lastPieceBlockLength = lastPieceLenthBytes % BLOCK_LENGTH;
        return {
            file: {
                bytes: this.length,
                pieces: pieceCount,
            },
            piece: (pieceIndex) => {
                const isLastPiece = pieceIndex === pieceCount - 1;
                return {
                    isLast: isLastPiece,
                    blocks: isLastPiece ? lastPieceBlockCount : regularPieceBlockCount,
                    bytes: isLastPiece ? lastPieceLenthBytes : this.pieceLength,
                    offset: pieceIndex * this.pieceLength,
                };
            },
            block: {
                regular: { bytes: BLOCK_LENGTH },
                last: { bytes: lastPieceBlockLength },
            },
        };
    }
}
exports.TorrentFile = TorrentFile;
//# sourceMappingURL=TorrentFile.js.map