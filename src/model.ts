import { encode } from "./encode";
import * as crypto from "node:crypto";

export type Token =
  | string
  | Buffer
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
    pieces: Buffer;
  };
};

export type BittorrentPeer = {
  id: string;
};

export class AddressInfo {
  constructor(public address: string, public port: number) {}
  public static fromString(s: string) {
    const [addr, port] = s.split(":");
    return new AddressInfo(addr, parseInt(port, 10));
  }
  public static fromBuffer(b: Buffer): AddressInfo {
    if (b.length !== 6) {
      throw new Error("Buffer must be of length 6");
    }
    return new AddressInfo(b.subarray(0, 4).join("."), b.readUInt16BE(4));
  }
  public toString() {
    return `${this.address}:${this.port}`;
  }
}

export function infoHash(t: TorrentFile): Buffer {
  const bencodedInfo = encode(t.info);
  const shasum = crypto.createHash("sha1");
  shasum.update(bencodedInfo);
  const digest = shasum.digest();
  return digest;
}

export function ensureDict(t: Token): Record<string, Token> {
  if (
    t instanceof Buffer ||
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
export function ensureBuffer(t: Token): Buffer {
  if (!(t instanceof Buffer)) {
    throw new Error(`${t} is not buf`);
  }
  return t;
}

export function toBuffer(s: string | number) {
  if (typeof s === "number") return toBuffer(s.toString(10));
  return Buffer.from(s, "ascii");
}
export function fromBuffer(b: Buffer) {
  return b.toString("ascii");
}

export function readInteger(b: Buffer) {
  return parseInt(fromBuffer(b));
}

export function stringifyBuffers(t: Token): Token {
  if (t instanceof Buffer) {
    t = fromBuffer(t);
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
