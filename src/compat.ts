export function toUint8Array(s: string | number): Uint8Array {
  if (typeof s === "number") return toUint8Array(s.toString(10));
  return Buffer.from(s, "ascii");
}
export function toString(b: Uint8Array): string {
  const decoder = new TextDecoder("ascii");
  return decoder.decode(b);
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

export function toHex(arr: Uint8Array): string {
  const hexes = Array.from(arr).map((x) => {
    let hex = x.toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return hex;
  });
  return hexes.join("");
}

export function concat(arrs: Uint8Array[]): Uint8Array {
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