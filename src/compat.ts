export function toUint8Array(s: string | number): Uint8Array {
  if (typeof s === "number") return toUint8Array(s.toString(10));
  return Buffer.from(s, "ascii");
}

export function toString(b: Uint8Array): string {
  return Buffer.from(b).toString("ascii");
}

export function readUInt16BE(arr: Uint8Array, offset: number): number {
  return (arr[offset] << 8) | arr[offset + 1];
}
export function readUInt32BE(arr: Uint8Array, offset: number): number {
  return (
    (arr[offset] << 24) |
    (arr[offset + 1] << 16) |
    (arr[offset + 2] << 8) |
    arr[offset + 3]
  );
}

export function writeUInt32BE(n: number): Uint8Array {
  return new Uint8Array([
    (n >> 24) & 0xff,
    (n >> 16) & 0xff,
    (n >> 8) & 0xff,
    n & 0xff,
  ]);
}
export function writeUInt16BE(n: number): Uint8Array {
  return new Uint8Array([(n >> 8) % 0xff, n % 0xff]);
}
export function toHex(
  arr: Uint8Array,
  splitByBytes?: number,
  offset: number = 0
): string {
  const lineOffset = Array(offset).fill(" ").join("");
  const strs: string[] = [];
  if (splitByBytes === 1) {
    strs.push(" 0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f");
    strs.push("-----------------------------------------------");
  }
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    if (i !== 0 && splitByBytes === 1 && i % 16 == 0) {
      strs.push(str);
      str = "";
    } else if (i !== 0 && splitByBytes !== undefined && i % splitByBytes == 0) {
      str += " ";
    }
    let hex = arr[i].toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    str += hex;
  }
  strs.push(str);
  str = "";
  return strs.map((x) => lineOffset + x).join("\n");
}

export function concat(...arrs: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const arr of arrs) {
    totalLength += arr.length;
  }
  const total = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrs) {
    total.set(arr, offset);
    offset += arr.length;
  }

  return total;
}
