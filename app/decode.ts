function consumeOnce(bencodedValue: string): {
  parsedValue: any;
  rest: string;
} {
  // checking for numbers
  if (bencodedValue.at(0) === "i") {
    const end = bencodedValue.indexOf("e");
    if (end === -1) {
      throw new Error("wrong integer");
    }

    const parsedValue = parseInt(bencodedValue.substring(1, end));
    return {
      parsedValue,
      rest: bencodedValue.substring(end + 1),
    };
  }

  // checking for strings
  if (!isNaN(parseInt(bencodedValue[0]))) {
    const colonIndex = bencodedValue.indexOf(":");
    const dataLength = parseInt(bencodedValue.substring(0, colonIndex));
    const totalLengthToParse = colonIndex + dataLength + 1;

    const parsedValue = bencodedValue.substring(
      colonIndex + 1,
      totalLengthToParse
    );
    return { parsedValue, rest: bencodedValue.substring(totalLengthToParse) };
  }

  //checking for lists
  if (bencodedValue.at(0) === "l") {
    let unconsumed = bencodedValue.substring(1);
    const list = [];
    while (unconsumed.at(0) !== "e") {
      const { parsedValue, rest } = consumeOnce(unconsumed);
      list.push(parsedValue);
      unconsumed = rest;
    }
    return {
      parsedValue: list,
      rest: unconsumed.substring(1),
    };
  }

  //checking for dicts
  if (bencodedValue.at(0) === "d") {
    let unconsumed = bencodedValue.substring(1);
    const list = [];
    while (unconsumed.at(0) !== "e") {
      const { parsedValue, rest } = consumeOnce(unconsumed);
      list.push(parsedValue);
      unconsumed = rest;
    }
    const dict: Record<string, any> = {};
    for (let i = 0; i < list.length; i += 2) {
      const key = list[i];
      if (typeof key != "string") continue;
      dict[key] = list[i + 1];
    }
    return {
      parsedValue: dict,
      rest: unconsumed.substring(1),
    };
  }

  throw new Error("Datatype not yet supported");
}

export function decodeBencode(bencodedValue: string) {
  const { parsedValue, rest } = consumeOnce(bencodedValue);
  return parsedValue;
}
