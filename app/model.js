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
exports.stringifyBuffers = exports.readInteger = exports.fromBuffer = exports.toBuffer = exports.ensureBuffer = exports.ensureInteger = exports.ensureDict = exports.infoHash = exports.AddressInfo = exports.ASCIIDigit = exports.END = exports.DICT_MARKER = exports.LIST_MARKER = exports.INTEGER_MARKER = exports.COLON = void 0;
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
    static fromBuffer(b) {
        if (b.length !== 6) {
            throw new Error("Buffer must be of length 6");
        }
        return new AddressInfo(b.subarray(0, 4).join("."), b.readUInt16BE(4));
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
    if (t instanceof Buffer ||
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
function ensureBuffer(t) {
    if (!(t instanceof Buffer)) {
        throw new Error(`${t} is not buf`);
    }
    return t;
}
exports.ensureBuffer = ensureBuffer;
function toBuffer(s) {
    if (typeof s === "number")
        return toBuffer(s.toString(10));
    return Buffer.from(s, "ascii");
}
exports.toBuffer = toBuffer;
function fromBuffer(b) {
    return b.toString("ascii");
}
exports.fromBuffer = fromBuffer;
function readInteger(b) {
    return parseInt(fromBuffer(b));
}
exports.readInteger = readInteger;
function stringifyBuffers(t) {
    if (t instanceof Buffer) {
        t = fromBuffer(t);
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
//# sourceMappingURL=model.js.map