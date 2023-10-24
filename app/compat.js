"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = exports.toHex = exports.readUInt16BE = exports.toString = exports.toUint8Array = void 0;
function toUint8Array(s) {
    if (typeof s === "number")
        return toUint8Array(s.toString(10));
    return Buffer.from(s, "ascii");
}
exports.toUint8Array = toUint8Array;
function toString(b) {
    const decoder = new TextDecoder("ascii");
    return decoder.decode(b);
}
exports.toString = toString;
function readUInt16BE(arr, offset) {
    return (arr[offset] << 8) | arr[offset + 1];
}
exports.readUInt16BE = readUInt16BE;
function toHex(arr) {
    const hexes = Array.from(arr).map((x) => {
        let hex = x.toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    });
    return hexes.join("");
}
exports.toHex = toHex;
function concat(arrs) {
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