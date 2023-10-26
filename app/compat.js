"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = exports.toHex = exports.writeUInt16BE = exports.writeUInt32BE = exports.readUInt32BE = exports.readUInt16BE = exports.toString = exports.toUint8Array = void 0;
function toUint8Array(s) {
    if (typeof s === "number")
        return toUint8Array(s.toString(10));
    return Buffer.from(s, "ascii");
}
exports.toUint8Array = toUint8Array;
function toString(b) {
    return Buffer.from(b).toString("ascii");
}
exports.toString = toString;
function readUInt16BE(arr, offset) {
    return (arr[offset] << 8) | arr[offset + 1];
}
exports.readUInt16BE = readUInt16BE;
function readUInt32BE(arr, offset) {
    return ((arr[offset] << 24) |
        (arr[offset + 1] << 16) |
        (arr[offset + 2] << 8) |
        arr[offset + 3]);
}
exports.readUInt32BE = readUInt32BE;
function writeUInt32BE(n) {
    return new Uint8Array([
        (n >> 24) & 0xff,
        (n >> 16) & 0xff,
        (n >> 8) & 0xff,
        n & 0xff,
    ]);
}
exports.writeUInt32BE = writeUInt32BE;
function writeUInt16BE(n) {
    return new Uint8Array([(n >> 8) % 0xff, n % 0xff]);
}
exports.writeUInt16BE = writeUInt16BE;
function toHex(arr, splitByBytes, offset = 0) {
    const lineOffset = Array(offset).fill(" ").join("");
    const strs = [];
    if (splitByBytes === 1) {
        strs.push(" 0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f");
        strs.push("-----------------------------------------------");
    }
    let str = "";
    for (let i = 0; i < arr.length; i++) {
        if (i !== 0 && splitByBytes === 1 && i % 16 == 0) {
            strs.push(str);
            str = "";
        }
        else if (i !== 0 && splitByBytes !== undefined && i % splitByBytes == 0) {
            str += " ";
        }
        let hex = arr[i].toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        str += hex;
    }
    strs.push(str);
    str = "";
    return strs.map((x) => lineOffset + x).join("\n");
}
exports.toHex = toHex;
function concat(...arrs) {
    let totalLength = 0;
    for (const arr of arrs) {
        totalLength += arr.length;
    }
    const total = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrs) {
        total.set(arr, offset);
        offset += arr.length;
    }
    return total;
}
exports.concat = concat;
//# sourceMappingURL=compat.js.map