import { readFileSync } from "node:fs";
import { decode } from "./decode";
import {
  TorrentFile,
  ensureBuffer,
  ensureDict,
  ensureInteger,
  ensureString,
  infoHash,
} from "./model";

export function parseTorrent(filename: string): TorrentFile {
  const data = readFileSync(filename);
  const dict = decode(data, false);
  const _dict = ensureDict(dict);
  const _dict_info = ensureDict(_dict.info);
  return {
    announce: ensureString(_dict.announce),
    info: {
      "piece length": ensureInteger(_dict_info["piece length"]),
      length: ensureInteger(_dict_info.length),
      name: ensureString(_dict_info.name),
      pieces: ensureBuffer(_dict_info.pieces),
    },
  };
}

export function infoTorrent(torrent: TorrentFile) {
  const { announce, info } = torrent;

  console.log(`Tracker URL: ${announce}`);
  console.log(`Length: ${info.length}`);
  const hex = infoHash(torrent).toString("hex");
  console.log(`Info Hash: ${hex}`);
  console.log(`Piece Length: ${info["piece length"]}`);
  console.log("Piece Hashes:");
  const pieces = info.pieces;
  const nPieces = pieces.length / 20;
  for (let piece = 0; piece < nPieces; piece++) {
    console.log(pieces.subarray(piece * 20, (piece + 1) * 20).toString("hex"));
  }
}
