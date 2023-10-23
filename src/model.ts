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

export function ensurestring(t: Token): string {
  if (t instanceof Buffer) {
    return t.toString("ascii");
  }
  if (typeof t === "string") {
    return t;
  }
  throw new Error(" is not string");
}
export function ensuredict(t: Token): Record<string, Token> {
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
export function ensureinteger(t: Token): number {
  if (typeof t !== "number") {
    throw new Error(" is not number");
  }
  return t;
}
export function ensurebuffer(t: Token): Buffer {
  if (!(t instanceof Buffer)) {
    throw new Error(" is not buf");
  }
  return t;
}
