import { readFileSync } from "node:fs";
import { decode } from "./decode";
import {
  TorrentFile,
  ensureBuffer,
  ensureDict,
  ensureInteger,
  fromBuffer,
  infoHash,
} from "./model";

export function parseTorrent(filename: string): TorrentFile {
  const data = readFileSync(filename);
  const decodedData = decode(data);
  const _dict = ensureDict(decodedData);
  const _dict_info = ensureDict(_dict.info);
  return {
    announce: fromBuffer(ensureBuffer(_dict.announce)),
    info: {
      "piece length": ensureInteger(_dict_info["piece length"]),
      length: ensureInteger(_dict_info.length),
      name: fromBuffer(ensureBuffer(_dict_info.name)),
      pieces: ensureBuffer(_dict_info.pieces),
    },
  };
}

export function infoTorrent(torrent: TorrentFile): string {
  const { announce, info } = torrent;
  const output: string[] = [];
  output.push(`Tracker URL: ${announce}`);
  output.push(`Length: ${info.length}`);
  const hex = infoHash(torrent).toString("hex");
  output.push(`Info Hash: ${hex}`);
  output.push(`Piece Length: ${info["piece length"]}`);
  output.push("Piece Hashes:");
  const pieces = info.pieces;
  const nPieces = pieces.length / 20;
  for (let piece = 0; piece < nPieces; piece++) {
    output.push(pieces.subarray(piece * 20, (piece + 1) * 20).toString("hex"));
  }

  return output.join("\n");
}
