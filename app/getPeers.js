"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeers = void 0;
const decode_1 = require("./decode");
const model_1 = require("./model");
const blobToU8A = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
};
async function getPeers(t) {
    const info_hash = (0, model_1.infoHash)(t);
    let info_hash_urle = "";
    for (let index = 0; index < info_hash.length; index++) {
        let hex = info_hash[index].toString(16);
        if (hex.length < 2)
            hex = "0" + hex;
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
    const _responseData = (0, decode_1.decode)(responseU8A);
    const responseData = (0, model_1.ensureDict)(_responseData);
    const _peers = responseData.peers;
    const peersU8A = (0, model_1.ensureU8A)(_peers);
    const nPeers = peersU8A.length / 6;
    const peers = [];
    for (let index = 0; index < nPeers; index++) {
        const peer = peersU8A.subarray(index * 6, (index + 1) * 6);
        peers.push(model_1.AddressInfo.fromU8A(peer));
    }
    return peers;
}
exports.getPeers = getPeers;
//# sourceMappingURL=getPeers.js.map