import fs from "node:fs/promises";
import { PeerAgent } from "./PeerAgent";
import { getPeers } from "./getPeers";
import { TorrentFile } from "./TorrentFile";
import { PartedDownloadManager } from "./PartedDownloadManager";

class ResettableTimeout {
  private timeoutID: NodeJS.Timeout | null;

  public reset() {
    this.cancel();
    this.start();
  }
  public cancel() {
    if (this.timeoutID !== null) clearTimeout(this.timeoutID);
  }
  public start() {
    this.timeoutID = setTimeout(this.callback, this.timeout);
  }
  constructor(private timeout: number, private callback: () => void) {
    this.timeoutID = null;
    this.start();
  }
}

async function worker(
  peerAgent: PeerAgent,
  torrent: TorrentFile,
  manager: PartedDownloadManager,
  handle: fs.FileHandle,
  name: string
) {
  async function workerAttempt(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let watchdog = new ResettableTimeout(10000, reject);

      await peerAgent.connect();
      watchdog.reset();

      await peerAgent.getBitfield();
      watchdog.reset();

      await peerAgent.sendInterested();
      watchdog.reset();

      await peerAgent.waitForUnchoke();
      watchdog.reset();

      while (manager.hasItem()) {
        const pieceIndex = manager.getAnyItem();
        const piece = await peerAgent.downloadPiece(pieceIndex);
        await handle.write(
          piece,
          0,
          piece.length,
          torrent.metrics.piece(pieceIndex).offset
        );
        watchdog.reset();
      }
      await peerAgent.close();
      watchdog.cancel();
      resolve();
    });
  }

  while (manager.hasItem()) {
    try {
      await workerAttempt();
    } catch {}
  }
}

export async function downloadFile(
  outputFile: string,
  torrentFilename: string
): Promise<string> {
  const file = await fs.open(outputFile, "w");
  const torrent = await TorrentFile.fromFilename(torrentFilename);
  const peers = await getPeers(torrent);

  const manager = new PartedDownloadManager(torrent.metrics.file.pieces);

  const workers = peers.map((peer, index) => {
    const agent = new PeerAgent(torrent, peer);
    return worker(agent, torrent, manager, file, `worker-${index}`);
  });

  await Promise.allSettled(workers);
  console.error("all settled");
  await file.close();
  console.error("file closed");
  return `Downloaded ${torrentFilename} to ${outputFile}.`;
}
