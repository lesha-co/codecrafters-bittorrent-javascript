import { readFileSync } from "node:fs";
import { decodeBencode } from "./decode";

export type TorrentFile = {
  announce: string;
  info: {
    length: number;
    name: string;
    piece_length: number;
    pieces: string[];
  };
};

export function parseTorrent(filename: string): TorrentFile {
  const buf = readFileSync(filename);
  const data = buf.toString("ascii");
  console.error(data);
  const dict = decodeBencode(data);
  return dict;
}
