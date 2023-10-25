import { toString, readUInt16BE, readUInt32BE } from "./compat";
import { encode } from "./encode";
import * as crypto from "node:crypto";

export type Token =
  | string
  | Uint8Array
  | number
  | Token[]
  | { [key: string]: Token };

export const COLON = 0x3a; // ':'
export const INTEGER_MARKER = 0x69; // 'i'
export const LIST_MARKER = 0x6c; // 'l'
export const DICT_MARKER = 0x64; // 'd'
export const END = 0x65; // 'e'

/**
 * Checks whether a given byte represents a digit in ASCII
 * @param byte 0-255 number
 */
export function ASCIIDigit(byte: number) {
  if (byte < 48 || byte > 57) return null;
  return byte - 48;
}

export type TorrentFile = {
  announce: string;
  "created by"?: string;
  info: {
    length: number;
    name: string;
    "piece length": number;
    pieces: Uint8Array;
  };
};

export class AddressInfo {
  constructor(public address: string, public port: number) {}
  public static fromString(s: string) {
    const [addr, port] = s.split(":");
    return new AddressInfo(addr, parseInt(port, 10));
  }
  public static fromU8A(b: Uint8Array): AddressInfo {
    if (b.length !== 6) {
      throw new Error("Uint8Array must be of length 6");
    }
    return new AddressInfo(b.subarray(0, 4).join("."), readUInt16BE(b, 4));
  }
  public toString() {
    return `${this.address}:${this.port}`;
  }
}

export function infoHash(t: TorrentFile): Uint8Array {
  const bencodedInfo = encode(t.info);
  const shasum = crypto.createHash("sha1");
  shasum.update(bencodedInfo);
  const digest = shasum.digest();
  return digest;
}

export function ensureDict(t: Token): Record<string, Token> {
  if (
    t instanceof Uint8Array ||
    typeof t === "number" ||
    Array.isArray(t) ||
    typeof t === "string"
  ) {
    throw new Error(" is not dict");
  }
  return t;
}
export function ensureInteger(t: Token): number {
  if (typeof t !== "number") {
    throw new Error(" is not number");
  }
  return t;
}
export function ensureU8A(t: Token): Uint8Array {
  if (!(t instanceof Uint8Array)) {
    throw new Error(`${t} is not buf`);
  }
  return t;
}

export function readInteger(b: Uint8Array) {
  return parseInt(toString(b));
}

export function stringifyBuffers(t: Token): Token {
  if (t instanceof Uint8Array) {
    t = toString(t);
  }
  if (typeof t === "number" || typeof t === "string") {
    return t;
  }
  if (Array.isArray(t)) {
    return t.map(stringifyBuffers);
  }
  // object
  const keys = Object.keys(t);
  const newObject: Record<string, Token> = {};
  for (const key of keys) {
    newObject[key] = stringifyBuffers(t[key]);
  }
  return newObject;
}

export const BLOCK_LENGTH = 2 ** 14;

export function getMetrics(torrent: TorrentFile, pieceIndex: number) {
  const totalFileLength = torrent.info.length;
  // file is divided into PIECES, each this long
  const pieceLength = torrent.info["piece length"];

  // we need download this many pieces, last one will be smaller
  const pieceCount = Math.ceil(totalFileLength / pieceLength);
  // this is how long the last piece is
  const lastPieceLenthBytes = totalFileLength % pieceLength;

  // is this piece the last?
  const isLastPiece = pieceIndex === pieceCount - 1;
  // then, each piece is divided in blocks, this many:
  const regularPieceBlockCount = pieceLength / BLOCK_LENGTH;
  // since last piece is smaller, it has different number of blocks
  const lastPieceBlockCount = Math.ceil(lastPieceLenthBytes / BLOCK_LENGTH);
  // also last block is smaller
  const lastBlockLength = lastPieceLenthBytes % BLOCK_LENGTH;
  return {
    totalFileLength,
    pieceLength,
    pieceCount,
    lastPieceLenthBytes,
    regularPieceBlockCount,
    lastPieceBlockCount,
    lastBlockLength,
    currentPieceBlockCount: isLastPiece
      ? lastPieceBlockCount
      : regularPieceBlockCount,
    currentPieceLengthBytes: isLastPiece ? lastPieceLenthBytes : pieceLength,
  };
}
