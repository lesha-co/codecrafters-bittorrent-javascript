"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePeerMessage = void 0;
const compat_1 = require("./compat");
// const TYPE_CHOKE= 0;
const TYPE_UNCHOKE = 1;
const TYPE_INTERESTED = 2;
// const TYPE_NOT_INTERESTED = 3;
// const TYPE_HAVE = 4;
const TYPE_BITFIELD = 5;
const TYPE_REQUEST = 7;
const TYPE_PIECE = 7;
function parsePeerMessage(msg) {
    const length = (0, compat_1.readUInt32BE)(msg, 0);
    if (msg.length != length + 4) {
        throw new Error("wrong length");
    }
    const type = msg[4];
    const payload = msg.slice(5);
    switch (type) {
        case TYPE_UNCHOKE: {
            return { type: "unchoke" };
        }
        case TYPE_INTERESTED: {
            return { type: "interested" };
        }
        case TYPE_BITFIELD: {
            return { type: "bitfield", payload };
        }
        case TYPE_REQUEST: {
            throw new Error("not implemented");
            // return { type: "request" };
        }
        case TYPE_PIECE: {
            return {
                type: "piece",
                index: payload[0],
                begin: payload[1],
                block: payload.slice(2),
            };
        }
        default: {
            throw new Error(`Message type ${type} is not handled`);
        }
    }
}
exports.parsePeerMessage = parsePeerMessage;
//# sourceMappingURL=peerMessage.js.map