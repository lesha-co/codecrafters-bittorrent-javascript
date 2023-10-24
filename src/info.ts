import { readFile } from "node:fs/promises";
import { decode } from "./decode";
import {
  TorrentFile,
  ensureU8A,
  ensureDict,
  ensureInteger,
  infoHash,
} from "./model";
import { toString, toHex } from "./compat";

export async function parseTorrent(filename: string): Promise<TorrentFile> {
  const data = await readFile(filename);
  const decodedData = decode(data);
  const _dict = ensureDict(decodedData);
  const _dict_info = ensureDict(_dict.info);
  return {
    announce: toString(ensureU8A(_dict.announce)),
    info: {
      "piece length": ensureInteger(_dict_info["piece length"]),
      length: ensureInteger(_dict_info.length),
      name: toString(ensureU8A(_dict_info.name)),
      pieces: ensureU8A(_dict_info.pieces),
    },
  };
}

export function infoTorrent(torrent: TorrentFile): string {
  const { announce, info } = torrent;
  const output: string[] = [];
  output.push(`Tracker URL: ${announce}`);
  output.push(`Length: ${info.length}`);
  const hex = toHex(infoHash(torrent));
  output.push(`Info Hash: ${hex}`);
  output.push(`Piece Length: ${info["piece length"]}`);
  output.push("Piece Hashes:");
  const pieces = info.pieces;
  const nPieces = pieces.length / 20;
  for (let piece = 0; piece < nPieces; piece++) {
    output.push(toHex(pieces.subarray(piece * 20, (piece + 1) * 20)));
  }

  return output.join("\n");
}
