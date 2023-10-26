"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyBuffers = exports.readInteger = exports.ensureU8A = exports.ensureInteger = exports.ensureDict = exports.AddressInfo = exports.ASCIIDigit = exports.END = exports.DICT_MARKER = exports.LIST_MARKER = exports.INTEGER_MARKER = exports.COLON = void 0;
const compat_1 = require("./compat");
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
//# sourceMappingURL=model.js.map