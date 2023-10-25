"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = void 0;
const compat_1 = require("./compat");
const model_1 = require("./model");
function encode(token) {
    if (typeof token === "number") {
        return new Uint8Array([model_1.INTEGER_MARKER, ...(0, compat_1.toUint8Array)(token), model_1.END]);
    }
    if (typeof token === "string") {
        return encode((0, compat_1.toUint8Array)(token));
    }
    if (token instanceof Uint8Array) {
        return new Uint8Array([...(0, compat_1.toUint8Array)(token.length), model_1.COLON, ...token]);
    }
    if (Array.isArray(token)) {
        const encodedTokens = token.map(encode);
        return new Uint8Array([model_1.LIST_MARKER, ...(0, compat_1.concat)(...encodedTokens), model_1.END]);
    }
    else {
        const keys = Object.keys(token).sort();
        const kv = keys.flatMap((key) => [
            encode((0, compat_1.toUint8Array)(key)),
            encode(token[key]),
        ]);
        return new Uint8Array([model_1.DICT_MARKER, ...(0, compat_1.concat)(...kv), model_1.END]);
    }
}
exports.encode = encode;
//# sourceMappingURL=encode.js.map