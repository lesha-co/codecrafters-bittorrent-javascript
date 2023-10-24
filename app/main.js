"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _main_1 = require("./_main");
async function main() {
    const command = process.argv[2];
    const argument = process.argv[3];
    const argument2 = process.argv[4];
    const result = await (0, _main_1._main)(command, argument, argument2);
    console.log(result);
}
main();
//# sourceMappingURL=main.js.map