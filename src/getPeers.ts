import { decode } from "./decode";
import {
  AddressInfo,
  TorrentFile,
  ensureBuffer,
  ensureDict,
  infoHash,
} from "./model";

const blobToBuffer = async (blob: Blob): Promise<Buffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
};

export async function getPeers(t: TorrentFile): Promise<AddressInfo[]> {
  const info_hash = infoHash(t);
  let info_hash_urle = "";
  for (let index = 0; index < info_hash.length; index++) {
    info_hash_urle += "%";
    info_hash_urle += info_hash[index].toString(16);
  }
  console.error("INFO HASH LEN " + info_hash.length);
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
  const responseBuffer = await blobToBuffer(responseBlob);
  const _responseData = decode(responseBuffer);
  const responseData = ensureDict(_responseData);
  const _peers = responseData.peers;
  const peersBuffer = ensureBuffer(_peers);
  const nPeers = peersBuffer.length / 6;

  const peers: AddressInfo[] = [];
  for (let index = 0; index < nPeers; index++) {
    const peer = peersBuffer.subarray(index * 6, (index + 1) * 6);
    peers.push(AddressInfo.fromBuffer(peer));
  }
  return peers;
}
