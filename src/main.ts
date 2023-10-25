import { _main } from "./_main";

async function main() {
  const command = process.argv[2];
  const argv = process.argv.slice(3);
  const result = await _main(command, argv);
  console.log(result);
}

main();
