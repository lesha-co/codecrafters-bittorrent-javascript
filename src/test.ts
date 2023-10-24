import { _main } from "./_main";

async function _test(command: string, argument: string, expected: string) {
  const result = await _main(command, argument);
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
}

test();
