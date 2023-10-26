"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peerMessageToString = exports.encodePeerMessage = exports.decodePeerMessage = exports.NotEnoughDataError = void 0;
const compat_1 = require("./compat");
const TYPE_CHOKE = 0;
const TYPE_UNCHOKE = 1;
const TYPE_INTERESTED = 2;
const TYPE_NOT_INTERESTED = 3;
const TYPE_HAVE = 4;
const TYPE_BITFIELD = 5;
const TYPE_REQUEST = 6;
const TYPE_PIECE = 7;
class NotEnoughDataError extends Error {
    expected;
    got;
    constructor(expected, message) {
        super(`Wrong length. received length ${message.length}, expected length ${expected}\n${(0, compat_1.toHex)(message, 1, 10)}`);
        this.expected = expected;
        this.got = message.length;
    }
}
exports.NotEnoughDataError = NotEnoughDataError;
function decodePeerMessage(msg) {
    const length = (0, compat_1.readUInt32BE)(msg, 0);
    const expectedLength = length + 4;
    if (msg.length < expectedLength) {
        throw new NotEnoughDataError(expectedLength, msg);
    }
    const extra = msg.length > expectedLength;
    const rest = extra ? msg.slice(expectedLength) : null;
    msg = msg.slice(0, expectedLength);
    const type = msg[4];
    const payload = msg.slice(5);
    switch (type) {
        case TYPE_UNCHOKE: {
            return { peerMessage: { type: "unchoke" }, rest };
        }
        case TYPE_INTERESTED: {
            return { peerMessage: { type: "interested" }, rest };
        }
        case TYPE_BITFIELD: {
            return { peerMessage: { type: "bitfield", payload }, rest };
        }
        case TYPE_REQUEST: {
            throw new Error("not implemented");
            // return { type: "request" };
        }
        case TYPE_PIECE: {
            return {
                peerMessage: {
                    type: "piece",
                    index: (0, compat_1.readUInt32BE)(payload, 0),
                    begin: (0, compat_1.readUInt32BE)(payload, 4),
                    block: payload.slice(8),
                },
                rest,
            };
        }
        default: {
            throw new Error(`Message type ${type} is not handled`);
        }
    }
}
exports.decodePeerMessage = decodePeerMessage;
function encodePeerMessage(msg) {
    const pad = (u8a) => {
        const totalLength = u8a.length;
        return (0, compat_1.concat)((0, compat_1.writeUInt32BE)(totalLength), u8a);
    };
    switch (msg.type) {
        case "unchoke":
            return pad(new Uint8Array([TYPE_UNCHOKE]));
        case "interested":
            return pad(new Uint8Array([TYPE_INTERESTED]));
        case "bitfield":
            throw new Error("not implemented");
        case "request":
            return pad(new Uint8Array([
                TYPE_REQUEST,
                ...(0, compat_1.writeUInt32BE)(msg.index),
                ...(0, compat_1.writeUInt32BE)(msg.begin),
                ...(0, compat_1.writeUInt32BE)(msg.length),
            ]));
        case "piece":
            return pad(new Uint8Array([TYPE_PIECE]));
    }
}
exports.encodePeerMessage = encodePeerMessage;
function peerMessageToString(msg, side) {
    switch (msg.type) {
        case "unchoke":
            return side === "them" ? "peer says unchoke" : "we say unchoke";
        case "interested":
            return side === "them"
                ? "peer says they're interested"
                : "we're saying that we interested";
        case "bitfield":
            return side === "them"
                ? `peer tells their bitfield: ${(0, compat_1.toHex)(msg.payload)}`
                : `we tell our bitfield: ${(0, compat_1.toHex)(msg.payload)}`;
        case "request":
            return side === "them"
                ? `peer requests piece ${msg.index}, begin at byte ${msg.begin}, length ${msg.length} `
                : `we request piece ${msg.index}, begin at byte ${msg.begin}, length ${msg.length} `;
        case "piece":
            return side === "them"
                ? `peer sends piece ${msg.index}, begin at byte ${msg.begin}, length ${msg.block.length} `
                : `we send piece ${msg.index}, begin at byte ${msg.begin}, length ${msg.block.length} `;
    }
}
exports.peerMessageToString = peerMessageToString;
//# sourceMappingURL=peerMessage.js.map