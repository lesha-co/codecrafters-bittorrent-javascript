import { readFileSync } from "node:fs";
import { decode } from "./decode";
import { TorrentFile, ensurebuffer, ensuredict, ensureinteger } from "./model";
import { encode } from "./encode";

import * as crypto from "node:crypto";

function parseTorrent(filename: string): TorrentFile {
  const data = readFileSync(filename);
  const dict = decode(data, false);
  const _dict = ensuredict(dict);
  const _dict_info = ensuredict(_dict.info);
  return {
    announce: ensurebuffer(_dict.announce).toString("ascii"),
    info: {
      "piece length": ensureinteger(_dict_info["piece length"]),
      length: ensureinteger(_dict_info.length),
      name: ensurebuffer(_dict_info.name).toString("ascii"),
      pieces: ensurebuffer(_dict_info.pieces),
    },
  };
}

export function infoTorrent(filename: string) {
  const { announce, info } = parseTorrent(filename);

  console.log(`Tracker URL: ${announce}`);
  console.log(`Length: ${info.length}`);
  const bencodedInfo = encode(info);
  const shasum = crypto.createHash("sha1");
  shasum.update(bencodedInfo);
  const hex = shasum.digest("hex");
  console.log(`Info Hash: ${hex}`);
  console.log(`Piece Length: ${info["piece length"]}`);
  console.log("Piece Hashes:");
  const pieces = info.pieces;
  const nPieces = pieces.length / 20;
  for (let piece = 0; piece < nPieces; piece++) {
    console.log(pieces.subarray(piece * 20, (piece + 1) * 20).toString("hex"));
  }
}
