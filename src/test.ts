import { _main } from "./_main";
import { readUInt32BE, toHex, writeUInt32BE } from "./compat";

async function _test(command: string, argument: string, expected: string) {
  const result = await _main(command, [argument]);
  console.log(
    result === expected ? "✅" : "❌",
    command,
    argument,
    expected,
    result
  );
}

async function test() {
  await _test("decode", "i64e", "64");
  await _test("decode", "9:raspberry", '"raspberry"');
  await _test("decode", "l9:pineapplei935ee", '["pineapple",935]');
  console.log(toHex(writeUInt32BE(16384)) === "00004000");

  console.log(
    toHex(
      writeUInt32BE(readUInt32BE(new Uint8Array([0x12, 0x34, 0x56, 0x78]), 0))
    ) == "12345678"
  );
}

test();
