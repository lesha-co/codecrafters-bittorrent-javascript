import { _main } from "./_main";

async function main() {
  const command = process.argv[2];
  const argument = process.argv[3];
  const argument2 = process.argv[4];
  const result = await _main(command, argument, argument2);
  console.log(result);
}

main();
