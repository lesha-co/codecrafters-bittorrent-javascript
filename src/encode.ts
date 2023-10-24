import {
  COLON,
  DICT_MARKER,
  END,
  INTEGER_MARKER,
  LIST_MARKER,
  Token,
  toBuffer,
} from "./model";

export function encode(token: Token): Buffer {
  if (typeof token === "number") {
    return Buffer.concat([
      Buffer.from([INTEGER_MARKER]),
      toBuffer(token),
      Buffer.from([END]),
    ]);
  }

  if (typeof token === "string") {
    return encode(toBuffer(token));
  }

  if (token instanceof Buffer) {
    return Buffer.concat([toBuffer(token.length), Buffer.from([COLON]), token]);
  }

  if (Array.isArray(token)) {
    return Buffer.concat([
      Buffer.from([LIST_MARKER]),
      ...token.map(encode),
      Buffer.from([END]),
    ]);
  } else {
    const keys = Object.keys(token).sort();
    const kv = keys.flatMap((key) => [
      encode(toBuffer(key)),
      encode(token[key]),
    ]);
    const totalBuffer = Buffer.concat([
      Buffer.from([DICT_MARKER]),
      ...kv,
      Buffer.from([END]),
    ]);
    return totalBuffer;
  }
}
