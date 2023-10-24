import net from "node:net";
import { AddressInfo, BittorrentPeer, TorrentFile, infoHash } from "./model";
import { toHex, toUint8Array } from "./compat";

export async function getPeerInfo(
  torrent: TorrentFile,
  peerAddress: AddressInfo
): Promise<BittorrentPeer> {
  /**
   * 
    length of the protocol string (BitTorrent protocol) which is 19 (1 byte)
    the string BitTorrent protocol (19 bytes)
    eight reserved bytes, which are all set to zero (8 bytes)
    sha1 infohash (20 bytes) (NOT the hexadecimal representation, which is 40 bytes long)
    peer id (20 bytes) (you can use 00112233445566778899 for this challenge)

   */
  return new Promise((resolve) => {
    const client = net.createConnection(
      peerAddress.port,
      peerAddress.address,
      () => {
        // Send data to the server after the connection is established
        client.write(Uint8Array.from([19]));
        client.write(toUint8Array("BitTorrent protocol"));
        client.write(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
        client.write(infoHash(torrent));
        client.write(toUint8Array("00112233445566778899"));
      }
    );

    // Listen for data from the server
    client.on("data", (data) => {
      const peerID = toHex(data.subarray(48, 68));
      // Close the connection after receiving data (if needed)
      client.end();
      resolve({ id: peerID });
    });
  });
}
