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
exports.getMetrics = exports.BLOCK_LENGTH = exports.stringifyBuffers = exports.readInteger = exports.ensureU8A = exports.ensureInteger = exports.ensureDict = exports.infoHash = exports.AddressInfo = exports.ASCIIDigit = exports.END = exports.DICT_MARKER = exports.LIST_MARKER = exports.INTEGER_MARKER = exports.COLON = void 0;
const compat_1 = require("./compat");
const encode_1 = require("./encode");
const crypto = __importStar(require("node:crypto"));
exports.COLON = 0x3a; // ':'
exports.INTEGER_MARKER = 0x69; // 'i'
exports.LIST_MARKER = 0x6c; // 'l'
exports.DICT_MARKER = 0x64; // 'd'
exports.END = 0x65; // 'e'
/**
 * Checks whether a given byte represents a digit in ASCII
 * @param byte 0-255 number
 */
function ASCIIDigit(byte) {
    if (byte < 48 || byte > 57)
        return null;
    return byte - 48;
}
exports.ASCIIDigit = ASCIIDigit;
class AddressInfo {
    address;
    port;
    constructor(address, port) {
        this.address = address;
        this.port = port;
    }
    static fromString(s) {
        const [addr, port] = s.split(":");
        return new AddressInfo(addr, parseInt(port, 10));
    }
    static fromU8A(b) {
        if (b.length !== 6) {
            throw new Error("Uint8Array must be of length 6");
        }
        return new AddressInfo(b.subarray(0, 4).join("."), (0, compat_1.readUInt16BE)(b, 4));
    }
    toString() {
        return `${this.address}:${this.port}`;
    }
}
exports.AddressInfo = AddressInfo;
function infoHash(t) {
    const bencodedInfo = (0, encode_1.encode)(t.info);
    const shasum = crypto.createHash("sha1");
    shasum.update(bencodedInfo);
    const digest = shasum.digest();
    return digest;
}
exports.infoHash = infoHash;
function ensureDict(t) {
    if (t instanceof Uint8Array ||
        typeof t === "number" ||
        Array.isArray(t) ||
        typeof t === "string") {
        throw new Error(" is not dict");
    }
    return t;
}
exports.ensureDict = ensureDict;
function ensureInteger(t) {
    if (typeof t !== "number") {
        throw new Error(" is not number");
    }
    return t;
}
exports.ensureInteger = ensureInteger;
function ensureU8A(t) {
    if (!(t instanceof Uint8Array)) {
        throw new Error(`${t} is not buf`);
    }
    return t;
}
exports.ensureU8A = ensureU8A;
function readInteger(b) {
    return parseInt((0, compat_1.toString)(b));
}
exports.readInteger = readInteger;
function stringifyBuffers(t) {
    if (t instanceof Uint8Array) {
        t = (0, compat_1.toString)(t);
    }
    if (typeof t === "number" || typeof t === "string") {
        return t;
    }
    if (Array.isArray(t)) {
        return t.map(stringifyBuffers);
    }
    // object
    const keys = Object.keys(t);
    const newObject = {};
    for (const key of keys) {
        newObject[key] = stringifyBuffers(t[key]);
    }
    return newObject;
}
exports.stringifyBuffers = stringifyBuffers;
exports.BLOCK_LENGTH = 2 ** 14;
function getMetrics(torrent, pieceIndex) {
    const totalFileLength = torrent.info.length;
    // file is divided into PIECES, each this bytes long
    const pieceLength = torrent.info["piece length"];
    // we need download this many pieces, last one will be smaller
    const pieceCount = Math.ceil(totalFileLength / pieceLength);
    // this is how long the last piece is
    const lastPieceLenthBytes = totalFileLength % pieceLength;
    // is this piece the last?
    const isLastPiece = pieceIndex === pieceCount - 1;
    // then, each piece is divided in blocks, this many:
    const regularPieceBlockCount = pieceLength / exports.BLOCK_LENGTH;
    // since last piece is smaller, it has different number of blocks
    const lastPieceBlockCount = Math.ceil(lastPieceLenthBytes / exports.BLOCK_LENGTH);
    // also last block is smaller
    const lastBlockLength = lastPieceLenthBytes % exports.BLOCK_LENGTH;
    return {
        file: {
            bytes: totalFileLength,
            pieces: pieceCount,
        },
        piece: {
            current: {
                isLast: isLastPiece,
                blocks: isLastPiece ? lastPieceBlockCount : regularPieceBlockCount,
                bytes: isLastPiece ? lastPieceLenthBytes : pieceLength,
            },
            regular: {
                blocks: regularPieceBlockCount,
                bytes: pieceLength,
            },
            last: {
                blocks: lastPieceBlockCount,
                bytes: lastPieceLenthBytes,
            },
        },
        block: {
            regular: { bytes: exports.BLOCK_LENGTH },
            last: { bytes: lastBlockLength },
        },
    };
}
exports.getMetrics = getMetrics;
//# sourceMappingURL=model.js.map