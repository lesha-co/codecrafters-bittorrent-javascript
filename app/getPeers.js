"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeers = void 0;
const decode_1 = require("./decode");
const model_1 = require("./model");
const blobToBuffer = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
};
async function getPeers(t) {
    const info_hash = (0, model_1.infoHash)(t);
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
    const _responseData = (0, decode_1.decode)(responseBuffer);
    const responseData = (0, model_1.ensureDict)(_responseData);
    const _peers = responseData.peers;
    const peersBuffer = (0, model_1.ensureBuffer)(_peers);
    const nPeers = peersBuffer.length / 6;
    const peers = [];
    for (let index = 0; index < nPeers; index++) {
        const peer = peersBuffer.subarray(index * 6, (index + 1) * 6);
        peers.push(model_1.AddressInfo.fromBuffer(peer));
    }
    return peers;
}
exports.getPeers = getPeers;
//# sourceMappingURL=getPeers.js.map