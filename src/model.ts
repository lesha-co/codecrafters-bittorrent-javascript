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

export function infoHash(t: TorrentFile): Buffer {
  const bencodedInfo = encode(t.info);
  const shasum = crypto.createHash("sha1");
  shasum.update(bencodedInfo);
  const digest = shasum.digest();
  return digest;
}

export function ensureString(t: Token): string {
  if (t instanceof Buffer) {
    return t.toString("ascii");
  }
  if (typeof t === "string") {
    return t;
  }
  throw new Error(" is not string");
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
