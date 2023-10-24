"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = void 0;
const model_1 = require("./model");
function encode(token) {
    if (typeof token === "number") {
        return Buffer.concat([
            Buffer.from([model_1.INTEGER_MARKER]),
            (0, model_1.toBuffer)(token),
            Buffer.from([model_1.END]),
        ]);
    }
    if (typeof token === "string") {
        return encode((0, model_1.toBuffer)(token));
    }
    if (token instanceof Buffer) {
        return Buffer.concat([(0, model_1.toBuffer)(token.length), Buffer.from([model_1.COLON]), token]);
    }
    if (Array.isArray(token)) {
        return Buffer.concat([
            Buffer.from([model_1.LIST_MARKER]),
            ...token.map(encode),
            Buffer.from([model_1.END]),
        ]);
    }
    else {
        const keys = Object.keys(token).sort();
        const kv = keys.flatMap((key) => [
            encode((0, model_1.toBuffer)(key)),
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