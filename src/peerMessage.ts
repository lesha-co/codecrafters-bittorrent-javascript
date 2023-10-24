import { readUInt32BE } from "./compat";

export type PeerMessage =
  | {
      type: "unchoke";
    }
  | {
      type: "interested";
    }
  | {
      type: "bitfield";
      payload: Uint8Array;
    }
  | {
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
    }
  | {
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

// const TYPE_CHOKE= 0;
const TYPE_UNCHOKE = 1;
const TYPE_INTERESTED = 2;
// const TYPE_NOT_INTERESTED = 3;
// const TYPE_HAVE = 4;
const TYPE_BITFIELD = 5;
const TYPE_REQUEST = 7;
const TYPE_PIECE = 7;

export function parsePeerMessage(msg: Uint8Array): PeerMessage {
  const length = readUInt32BE(msg, 0);
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
