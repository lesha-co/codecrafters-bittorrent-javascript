"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBuffer = exports.ensureInteger = exports.ensureDict = exports.ensureString = exports.infoHash = exports.END = exports.DICT_MARKER = exports.LIST_MARKER = exports.INTEGER_MARKER = exports.COLON = void 0;
const encode_1 = require("./encode");
const crypto = require("node:crypto");
exports.COLON = 0x3a; // ':'
exports.INTEGER_MARKER = 0x69; // 'i'
exports.LIST_MARKER = 0x6c; // 'l'
exports.DICT_MARKER = 0x64; // 'd'
exports.END = 0x65; // 'e'
function infoHash(t) {
    const bencodedInfo = (0, encode_1.encode)(t.info);
    const shasum = crypto.createHash("sha1");
    shasum.update(bencodedInfo);
    const digest = shasum.digest();
    return digest;
}
exports.infoHash = infoHash;
function ensureString(t) {
    if (t instanceof Buffer) {
        return t.toString("ascii");
    }
    if (typeof t === "string") {
        return t;
    }
    throw new Error(" is not string");
}
exports.ensureString = ensureString;
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
//# sourceMappingURL=model.js.map