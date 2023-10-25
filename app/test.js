"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _main_1 = require("./_main");
const compat_1 = require("./compat");
async function _test(command, argument, expected) {
    const result = await (0, _main_1._main)(command, [argument]);
    console.log(result === expected ? "✅" : "❌", command, argument, expected, result);
}
async function test() {
    await _test("decode", "i64e", "64");
    await _test("decode", "9:raspberry", '"raspberry"');
    await _test("decode", "l9:pineapplei935ee", '["pineapple",935]');
    console.log((0, compat_1.toHex)((0, compat_1.writeUInt32BE)(16384)) === "00004000");
    console.log((0, compat_1.toHex)((0, compat_1.writeUInt32BE)((0, compat_1.readUInt32BE)(new Uint8Array([0x12, 0x34, 0x56, 0x78]), 0))) == "12345678");
}
test();
//# sourceMappingURL=test.js.map