import { readFile } from "node:fs/promises";
import { encode } from "./encode";
import * as crypto from "node:crypto";
import { decode } from "./decode";
import { ensureDict, ensureInteger, ensureU8A } from "./model";
import { toString } from "./compat";

export type Metrics = {
  file: {
    bytes: number;
    pieces: number;
  };
  piece: (pieceIndex: number) => {
    isLast: boolean;
    blocks: number;
    bytes: number;
    offset: number;
  };
  block: {
    regular: { bytes: number };
    last: { bytes: number };
  };
};

export class TorrentFile {
  public readonly metrics: Metrics;
  public static async fromFilename(filename: string): Promise<TorrentFile> {
    const data = await readFile(filename);
    const decodedData = decode(data);
    const _dict = ensureDict(decodedData);
    const _dict_info = ensureDict(_dict.info);
    return new TorrentFile(
      toString(ensureU8A(_dict.announce)),
      ensureInteger(_dict_info.length),
      ensureInteger(_dict_info["piece length"]),
      ensureU8A(_dict_info.pieces),
      toString(ensureU8A(_dict_info.name))
    );
  }

  constructor(
    public readonly announce: string,
    private readonly length: number,
    public readonly pieceLength: number,
    public readonly pieces: Uint8Array,
    public readonly name: string
  ) {
    this.metrics = this.getMetrics();
  }

  public infoHash(): Uint8Array {
    const bencodedInfo = encode({
      length: this.length,
      name: this.name,
      "piece length": this.pieceLength,
      pieces: this.pieces,
    });
    const shasum = crypto.createHash("sha1");
    shasum.update(bencodedInfo);
    const digest = shasum.digest();
    return digest;
  }

  private getMetrics(): Metrics {
    const BLOCK_LENGTH = 2 ** 14;

    // we need download this many pieces, last one will be smaller
    const pieceCount = Math.ceil(this.length / this.pieceLength);
    // this is how long the last piece is
    const lastPieceLenthBytes = this.length % this.pieceLength;

    // then, each piece is divided in blocks, this many:
    const regularPieceBlockCount = this.pieceLength / BLOCK_LENGTH;
    // since last piece is smaller, it has different number of blocks
    const lastPieceBlockCount = Math.ceil(lastPieceLenthBytes / BLOCK_LENGTH);
    // also last block is smaller
    const lastPieceBlockLength = lastPieceLenthBytes % BLOCK_LENGTH;
    return {
      file: {
        bytes: this.length,
        pieces: pieceCount,
      },
      piece: (pieceIndex: number) => {
        const isLastPiece = pieceIndex === pieceCount - 1;
        return {
          isLast: isLastPiece,
          blocks: isLastPiece ? lastPieceBlockCount : regularPieceBlockCount,
          bytes: isLastPiece ? lastPieceLenthBytes : this.pieceLength,
          offset: pieceIndex * this.pieceLength,
        };
      },
      block: {
        regular: { bytes: BLOCK_LENGTH },
        last: { bytes: lastPieceBlockLength },
      },
    };
  }
}

export type TorrentFileRepr = {
  announce: string;
  "created by"?: string;
  info: {
    length: number;
    name: string;
    "piece length": number;
    pieces: Uint8Array;
  };
};
