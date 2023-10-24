"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _main_1 = require("./_main");
async function main() {
    const command = process.argv[2];
    const argv = process.argv.slice(3);
    const result = await (0, _main_1._main)(command, argv);
    console.error("vvvvv result");
    console.log(result);
    console.error("^^^^^ result");
}
main();
//# sourceMappingURL=main.js.map