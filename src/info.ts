import { toHex } from "./compat";
import { TorrentFile } from "./TorrentFile";

export function infoTorrent(torrent: TorrentFile): string {
  const output: string[] = [];
  output.push(`Tracker URL: ${torrent.announce}`);
  output.push(`Length: ${torrent.metrics.file.bytes}`);
  const hex = toHex(torrent.infoHash());
  output.push(`Info Hash: ${hex}`);
  output.push(`Piece Length: ${torrent.pieceLength}`);
  output.push("Piece Hashes:");
  const pieces = torrent.pieces;
  const nPieces = pieces.length / 20;
  for (let piece = 0; piece < nPieces; piece++) {
    output.push(toHex(pieces.subarray(piece * 20, (piece + 1) * 20)));
  }

  return output.join("\n");
}
