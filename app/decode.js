"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const model_1 = require("./model");
function decode(bencodedValue) {
    const { parsedValue, rest } = consumeOnce(bencodedValue);
    if (rest.length) {
        throw new Error("Extra characters after end of sequence");
    }
    return parsedValue;
}
exports.decode = decode;
function consumeOnce(bencodedValue) {
    // checking for numbers
    if (bencodedValue[0] === model_1.INTEGER_MARKER) {
        return consumeInteger(bencodedValue);
    }
    // checking for strings
    if ((0, model_1.ASCIIDigit)(bencodedValue[0]) !== null) {
        return consumeString(bencodedValue);
    }
    //checking for lists
    if (bencodedValue[0] === model_1.LIST_MARKER) {
        return consumeSequence(bencodedValue);
    }
    //checking for dicts
    if (bencodedValue[0] === model_1.DICT_MARKER) {
        return consumeDict(bencodedValue);
    }
    throw new Error("Datatype not yet supported");
}
function consumeSequence(bencodedValue) {
    let unconsumed = bencodedValue.subarray(1);
    const list = [];
    while (unconsumed[0] !== model_1.END) {
        const { parsedValue, rest } = consumeOnce(unconsumed);
        list.push(parsedValue);
        unconsumed = rest;
    }
    return {
        parsedValue: list,
        rest: unconsumed.subarray(1),
    };
}
function consumeInteger(bencodedValue) {
    const end = bencodedValue.indexOf(model_1.END);
    if (end === -1) {
        throw new Error("wrong integer");
    }
    const parsedValue = (0, model_1.readInteger)(bencodedValue.subarray(1, end));
    return {
        parsedValue,
        rest: bencodedValue.subarray(end + 1),
    };
}
function consumeDict(bencodedValue) {
    const { parsedValue, rest } = consumeSequence(bencodedValue);
    const dict = {};
    for (let i = 0; i < parsedValue.length; i += 2) {
        const key = (0, model_1.fromBuffer)((0, model_1.ensureBuffer)(parsedValue[i]));
        dict[key] = parsedValue[i + 1];
    }
    return {
        parsedValue: dict,
        rest,
    };
}
function consumeString(bencodedValue) {
    const colonIndex = bencodedValue.indexOf(model_1.COLON);
    const dataLength = (0, model_1.readInteger)(bencodedValue.subarray(0, colonIndex));
    const totalLengthToParse = colonIndex + dataLength + 1;
    const parsedValue = bencodedValue.subarray(colonIndex + 1, totalLengthToParse);
    return {
        parsedValue,
        rest: bencodedValue.subarray(totalLengthToParse),
    };
}
//# sourceMappingURL=decode.js.map