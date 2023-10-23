import {
  Token,
  COLON,
  DICT_MARKER,
  END,
  INTEGER_MARKER,
  LIST_MARKER,
  ensureBuffer,
  ensureString,
} from "./model";

function consumeSequence(
  bencodedValue: Buffer,
  stringifyBuffers: boolean
): {
  parsedValue: Token[];
  rest: Buffer;
} {
  let unconsumed = bencodedValue.subarray(1);
  const list = [];
  while (unconsumed[0] !== END) {
    const { parsedValue, rest } = consumeOnce(unconsumed, stringifyBuffers);
    list.push(parsedValue);
    unconsumed = rest;
  }
  return {
    parsedValue: list,
    rest: unconsumed.subarray(1),
  };
}

function consumeOnce(
  bencodedValue: Buffer,
  stringifyBuffers: boolean
): {
  parsedValue: Token;
  rest: Buffer;
} {
  // checking for numbers
  if (bencodedValue[0] === INTEGER_MARKER) {
    const end = bencodedValue.indexOf("e");
    if (end === -1) {
      throw new Error("wrong integer");
    }

    const parsedValue = parseInt(
      bencodedValue.subarray(1, end).toString("ascii")
    );
    return {
      parsedValue,
      rest: bencodedValue.subarray(end + 1),
    };
  }
  // checking for strings
  if (!isNaN(parseInt(bencodedValue.subarray(0, 1).toString("ascii")))) {
    const colonIndex = bencodedValue.indexOf(COLON);
    const dataLength = parseInt(
      bencodedValue.subarray(0, colonIndex).toString("ascii")
    );
    const totalLengthToParse = colonIndex + dataLength + 1;

    const parsedValue = bencodedValue.subarray(
      colonIndex + 1,
      totalLengthToParse
    );
    return {
      parsedValue: stringifyBuffers
        ? parsedValue.toString("ascii")
        : parsedValue,
      rest: bencodedValue.subarray(totalLengthToParse),
    };
  }

  //checking for lists
  if (bencodedValue[0] === LIST_MARKER) {
    return consumeSequence(bencodedValue, stringifyBuffers);
  }

  //checking for dicts
  if (bencodedValue[0] === DICT_MARKER) {
    const { parsedValue, rest } = consumeSequence(
      bencodedValue,
      stringifyBuffers
    );

    const dict: Record<string, any> = {};
    for (let i = 0; i < parsedValue.length; i += 2) {
      const key = stringifyBuffers
        ? ensureString(parsedValue[i])
        : ensureBuffer(parsedValue[i]).toString("ascii");

      dict[key] = parsedValue[i + 1];
    }
    return {
      parsedValue: dict,
      rest,
    };
  }

  throw new Error("Datatype not yet supported");
}

export function decode(bencodedValue: Buffer, stringifyBuffers: boolean) {
  const { parsedValue, rest } = consumeOnce(bencodedValue, stringifyBuffers);
  if (rest.length) {
    throw new Error("Extra characters after end of sequence");
  }
  return parsedValue;
}
