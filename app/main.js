"use strict";
// const process = require("node:process");
const util = require("node:util");
// type Primitive = string | number;
// type Primitive2 = Primitive | Primitive[];
// type Data = Primitive2 & Primitive2[];
// const d1: Data = 1;
// const d2: Data = "1";
// const d3: Data = ["1", 1];
// const d4: Data = ["1", 1, [1, 2, 3]];
function consumeOnce(bencodedValue) {
    // checking for numbers
    if (bencodedValue.at(0) === "i") {
        const end = bencodedValue.indexOf("e");
        if (end === -1) {
            throw new Error("wrong integer");
        }
        const parsedValue = parseInt(bencodedValue.substring(1, end));
        return {
            parsedValue,
            rest: bencodedValue.substring(end),
        };
    }
    // checking for strings
    if (!isNaN(parseInt(bencodedValue[0]))) {
        const colonIndex = bencodedValue.indexOf(":");
        const dataLength = parseInt(bencodedValue.substring(0, colonIndex));
        const totalLengthToParse = colonIndex + dataLength + 1;
        const parsedValue = bencodedValue.substring(colonIndex + 1, totalLengthToParse);
        return { parsedValue, rest: bencodedValue.substring(totalLengthToParse) };
    }
    //checking for lists
    if (bencodedValue.at(0) === "l") {
        let unconsumed = bencodedValue.substring(1);
        const list = [];
        while (true) {
            const { parsedValue, rest } = consumeOnce(unconsumed);
            list.push(parsedValue);
            if (rest.at(0) === "e") {
                unconsumed = rest.substring(1);
                return {
                    parsedValue: list,
                    rest: unconsumed,
                };
            }
            else {
                unconsumed = rest;
            }
        }
    }
    throw new Error("Datatype not yet supported");
}
function decodeBencode(bencodedValue) {
    const { parsedValue, rest } = consumeOnce(bencodedValue);
    if (Array.isArray(parsedValue)) {
        console.log(`[${parsedValue
            .map((x) => (typeof x === "number" ? x : `"${x}"`))
            .join(",")}]`);
    }
    else {
        console.log(parsedValue);
    }
}
function main() {
    const command = process.argv[2];
    // You can use print statements as follows for debugging, they'll be visible when running tests.
    // console.log("Logs from your program will appear here!");
    // Uncomment this block to pass the first stage
    if (command === "decode") {
        const bencodedValue = process.argv[3];
        // In JavaScript, there's no need to manually convert bytes to string for printing
        // because JS doesn't distinguish between bytes and strings in the same way Python does.
        console.log(JSON.stringify(decodeBencode(bencodedValue)));
    }
    else {
        throw new Error(`Unknown command ${command}`);
    }
}
main();
