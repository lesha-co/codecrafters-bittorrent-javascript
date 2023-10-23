"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = void 0;
const model_1 = require("./model");
function encode(token) {
    if (typeof token === "number") {
        return Buffer.from(`i${token.toString(10)}e`, "ascii");
    }
    else if (typeof token === "string") {
        const buffer = Buffer.from(token);
        return encode(buffer);
    }
    else if (token instanceof Buffer) {
        const length = token.length.toString(10);
        const buf = Buffer.alloc(length.length + 1 + token.length);
        buf.write(length, 0, "ascii");
        buf.writeUint8(model_1.COLON, length.length);
        token.copy(buf, length.length + 1);
        return buf;
    }
    else if (Array.isArray(token)) {
        const totalBuffer = Buffer.concat([
            Buffer.from([model_1.LIST_MARKER]),
            ...token.map(encode),
            Buffer.from([model_1.END]),
        ]);
        return totalBuffer;
    }
    else {
        const keys = Object.keys(token).sort();
        const kv = keys.flatMap((key) => [
            encode(Buffer.from(key, "ascii")),
            encode(token[key]),
        ]);
        const totalBuffer = Buffer.concat([
            Buffer.from([model_1.DICT_MARKER]),
            ...kv,
            Buffer.from([model_1.END]),
        ]);
        return totalBuffer;
    }
}
exports.encode = encode;
//# sourceMappingURL=encode.js.map