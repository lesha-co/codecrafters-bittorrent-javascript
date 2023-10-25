import { concat, toUint8Array } from "./compat";
import {
  COLON,
  DICT_MARKER,
  END,
  INTEGER_MARKER,
  LIST_MARKER,
  Token,
} from "./model";

export function encode(token: Token): Uint8Array {
  if (typeof token === "number") {
    return new Uint8Array([INTEGER_MARKER, ...toUint8Array(token), END]);
  }

  if (typeof token === "string") {
    return encode(toUint8Array(token));
  }

  if (token instanceof Uint8Array) {
    return new Uint8Array([...toUint8Array(token.length), COLON, ...token]);
  }

  if (Array.isArray(token)) {
    const encodedTokens = token.map(encode);
    return new Uint8Array([LIST_MARKER, ...concat(...encodedTokens), END]);
  } else {
    const keys = Object.keys(token).sort();
    const kv = keys.flatMap((key) => [
      encode(toUint8Array(key)),
      encode(token[key]),
    ]);
    return new Uint8Array([DICT_MARKER, ...concat(...kv), END]);
  }
}
