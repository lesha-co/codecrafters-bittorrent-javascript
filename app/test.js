"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _main_1 = require("./_main");
async function _test(command, argument, expected) {
    const result = await (0, _main_1._main)(command, argument);
    console.log(result === expected ? "✅" : "❌", command, argument, expected, result);
}
async function test() {
    await _test("decode", "i64e", "64");
    await _test("decode", "9:raspberry", '"raspberry"');
    await _test("decode", "l9:pineapplei935ee", '["pineapple",935]');
}
test();
//# sourceMappingURL=test.js.map