import { concat, readUInt32BE, toHex, writeUInt32BE } from "./compat";

export type PeerMessagePiece = {
  type: "piece";
  /**
   * the zero-based piece index
   */
  index: number;
  /**
   * the zero-based byte offset within the piece
   */
  begin: number;
  /**
   * the data for the piece, usually 2^14 bytes long
   */
  block: Uint8Array;
};
export type PeerMessageRequest = {
  type: "request";
  /**
   * the zero-based piece index
   */
  index: number;
  /**
   * the zero-based byte offset within the piece
   * This'll be 0 for the first block, 2^14 for the second block,
   * 2*2^14 for the third block etc.
   */
  begin: number;
  /**
   * the length of the block in bytes
   * This'll be 2^14 (16 * 1024) for all blocks except the last one.
   * The last block will contain 2^14 bytes or less, you'll need
   * calculate this value using the piece length.
   */
  length: number;
};
type PeerMessageBitfield = {
  type: "bitfield";
  payload: Uint8Array;
};

type PeerMessageInterested = {
  type: "interested";
};

type PeerMessageUnchoke = {
  type: "unchoke";
};

export type PeerMessage =
  | PeerMessageUnchoke
  | PeerMessageInterested
  | PeerMessageBitfield
  | PeerMessageRequest
  | PeerMessagePiece;

const TYPE_CHOKE = 0;
const TYPE_UNCHOKE = 1;
const TYPE_INTERESTED = 2;
const TYPE_NOT_INTERESTED = 3;
const TYPE_HAVE = 4;
const TYPE_BITFIELD = 5;
const TYPE_REQUEST = 6;
const TYPE_PIECE = 7;

export class NotEnoughDataError extends Error {
  public got: number;
  constructor(public expected: number, message: Uint8Array) {
    super(
      `Wrong length. received length ${
        message.length
      }, expected length ${expected}\n${toHex(message, 1, 10)}`
    );
    this.got = message.length;
  }
}

export function decodePeerMessage(msg: Uint8Array): {
  peerMessage: PeerMessage;
  rest: Uint8Array | null;
} {
  const length = readUInt32BE(msg, 0);
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
          index: readUInt32BE(payload, 0),
          begin: readUInt32BE(payload, 4),
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

export function encodePeerMessage(msg: PeerMessage): Uint8Array {
  const pad = (u8a: Uint8Array) => {
    const totalLength = u8a.length;
    return concat(writeUInt32BE(totalLength), u8a);
  };
  switch (msg.type) {
    case "unchoke":
      return pad(new Uint8Array([TYPE_UNCHOKE]));
    case "interested":
      return pad(new Uint8Array([TYPE_INTERESTED]));
    case "bitfield":
      throw new Error("not implemented");
    case "request":
      return pad(
        new Uint8Array([
          TYPE_REQUEST,
          ...writeUInt32BE(msg.index),
          ...writeUInt32BE(msg.begin),
          ...writeUInt32BE(msg.length),
        ])
      );
    case "piece":
      return pad(new Uint8Array([TYPE_PIECE]));
  }
}

export function peerMessageToString(
  msg: PeerMessage,
  side: "us" | "them"
): string {
  switch (msg.type) {
    case "unchoke":
      return side === "them" ? "peer says unchoke" : "we say unchoke";
    case "interested":
      return side === "them"
        ? "peer says they're interested"
        : "we're saying that we interested";
    case "bitfield":
      return side === "them"
        ? `peer tells their bitfield: ${toHex(msg.payload)}`
        : `we tell our bitfield: ${toHex(msg.payload)}`;
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
