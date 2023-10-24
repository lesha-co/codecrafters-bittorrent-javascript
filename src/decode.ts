import {
  Token,
  COLON,
  DICT_MARKER,
  END,
  INTEGER_MARKER,
  LIST_MARKER,
  ensureBuffer,
  ASCIIDigit,
  readInteger,
  fromBuffer,
} from "./model";

type ConsumeResult<Result = Token> = {
  parsedValue: Result;
  rest: Buffer;
};

export function decode(bencodedValue: Buffer) {
  const { parsedValue, rest } = consumeOnce(bencodedValue);
  if (rest.length) {
    throw new Error("Extra characters after end of sequence");
  }
  return parsedValue;
}

function consumeOnce(bencodedValue: Buffer): ConsumeResult {
  // checking for numbers
  if (bencodedValue[0] === INTEGER_MARKER) {
    return consumeInteger(bencodedValue);
  }
  // checking for strings
  if (ASCIIDigit(bencodedValue[0]) !== null) {
    return consumeString(bencodedValue);
  }

  //checking for lists
  if (bencodedValue[0] === LIST_MARKER) {
    return consumeSequence(bencodedValue);
  }

  //checking for dicts
  if (bencodedValue[0] === DICT_MARKER) {
    return consumeDict(bencodedValue);
  }

  throw new Error("Datatype not yet supported");
}

function consumeSequence(bencodedValue: Buffer): ConsumeResult<Token[]> {
  let unconsumed = bencodedValue.subarray(1);
  const list = [];
  while (unconsumed[0] !== END) {
    const { parsedValue, rest } = consumeOnce(unconsumed);
    list.push(parsedValue);
    unconsumed = rest;
  }
  return {
    parsedValue: list,
    rest: unconsumed.subarray(1),
  };
}

function consumeInteger(bencodedValue: Buffer): ConsumeResult {
  const end = bencodedValue.indexOf(END);
  if (end === -1) {
    throw new Error("wrong integer");
  }

  const parsedValue = readInteger(bencodedValue.subarray(1, end));
  return {
    parsedValue,
    rest: bencodedValue.subarray(end + 1),
  };
}

function consumeDict(bencodedValue: Buffer): ConsumeResult {
  const { parsedValue, rest } = consumeSequence(bencodedValue);

  const dict: Record<string, any> = {};
  for (let i = 0; i < parsedValue.length; i += 2) {
    const key = fromBuffer(ensureBuffer(parsedValue[i]));
    dict[key] = parsedValue[i + 1];
  }
  return {
    parsedValue: dict,
    rest,
  };
}

function consumeString(bencodedValue: Buffer) {
  const colonIndex = bencodedValue.indexOf(COLON);
  const dataLength = readInteger(bencodedValue.subarray(0, colonIndex));
  const totalLengthToParse = colonIndex + dataLength + 1;

  const parsedValue = bencodedValue.subarray(
    colonIndex + 1,
    totalLengthToParse
  );
  return {
    parsedValue,
    rest: bencodedValue.subarray(totalLengthToParse),
  };
}
