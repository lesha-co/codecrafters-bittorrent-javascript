"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensurebuffer = exports.ensureinteger = exports.ensuredict = exports.ensurestring = exports.END = exports.DICT_MARKER = exports.LIST_MARKER = exports.INTEGER_MARKER = exports.COLON = void 0;
exports.COLON = 0x3a; // ':'
exports.INTEGER_MARKER = 0x69; // 'i'
exports.LIST_MARKER = 0x6c; // 'l'
exports.DICT_MARKER = 0x64; // 'd'
exports.END = 0x65; // 'e'
function ensurestring(t) {
    if (t instanceof Buffer) {
        return t.toString("ascii");
    }
    if (typeof t === "string") {
        return t;
    }
    throw new Error(" is not string");
}
exports.ensurestring = ensurestring;
function ensuredict(t) {
    if (t instanceof Buffer ||
        typeof t === "number" ||
        Array.isArray(t) ||
        typeof t === "string") {
        throw new Error(" is not dict");
    }
    return t;
}
exports.ensuredict = ensuredict;
function ensureinteger(t) {
    if (typeof t !== "number") {
        throw new Error(" is not number");
    }
    return t;
}
exports.ensureinteger = ensureinteger;
function ensurebuffer(t) {
    if (!(t instanceof Buffer)) {
        throw new Error(" is not buf");
    }
    return t;
}
exports.ensurebuffer = ensurebuffer;
//# sourceMappingURL=model.js.map