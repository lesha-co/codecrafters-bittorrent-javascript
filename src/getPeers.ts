import { decode } from "./decode";
import {
  AddressInfo,
  TorrentFile,
  ensureU8A,
  ensureDict,
  infoHash,
} from "./model";

const blobToU8A = async (blob: Blob): Promise<Uint8Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export async function getPeers(t: TorrentFile): Promise<AddressInfo[]> {
  console.error(`contacting tracker...`);
  const info_hash = infoHash(t);
  let info_hash_urle = "";
  for (let index = 0; index < info_hash.length; index++) {
    let hex = info_hash[index].toString(16);
    if (hex.length < 2) hex = "0" + hex;
    info_hash_urle += "%";
    info_hash_urle += hex;
  }
  const url = new URL(t.announce);
  // url.searchParams.append("info_hash", info_hash_urle);
  url.searchParams.append("peer_id", "00112233445566778899");
  url.searchParams.append("port", "6881");
  url.searchParams.append("uploaded", "0");
  url.searchParams.append("downloaded", "0");
  url.searchParams.append("left", t.info.length.toString());
  url.searchParams.append("compact", "1");
  const href = url.href + "&info_hash=" + info_hash_urle;
  const response = await fetch(href);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const responseBlob = await response.blob();
  const responseU8A = await blobToU8A(responseBlob);
  const _responseData = decode(responseU8A);
  const responseData = ensureDict(_responseData);
  const _peers = responseData.peers;
  const peersU8A = ensureU8A(_peers);
  const nPeers = peersU8A.length / 6;

  const peers: AddressInfo[] = [];
  for (let index = 0; index < nPeers; index++) {
    const peer = peersU8A.subarray(index * 6, (index + 1) * 6);
    peers.push(AddressInfo.fromU8A(peer));
  }
  console.error(`got ${peers.length} peer(s): ${peers.join("; ")}`);
  return peers;
}
