/*
  preview_test.ts
  A lightweight TypeScript preview/testing script.

  Features:
  - Prints header with timestamp
  - Runs small fixed checks (factorial, prime check, sort)
  - Supports: `ts-node preview_test.ts --cases 5`
  - Includes a simple async input echo for previewing stdin

  Run:
    ts-node preview_test.ts
    ts-node preview_test.ts --cases 5
*/

// factorial
function factorial(n: number): number {
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// primality
function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

function printHeader() {
  console.log('=== Preview Test: preview_test.ts ===');
  console.log('Runtime: Node + ts-node | Quick sanity checks');
  console.log('Timestamp:', new Date().toString());
  console.log('==========================================\n');
}

function runFixedChecks() {
  console.log('-- Fixed checks --\n');

  console.log('Factorial samples:');
  [0, 1, 2, 5, 10].forEach((n) => console.log(`${n}! = ${factorial(n)}`));
  console.log();

  console.log('Primality samples:');
  [1, 2, 3, 4, 16, 17, 19, 20, 97].forEach((n) =>
    console.log(n, isPrime(n) ? 'is prime' : 'is not prime')
  );
  console.log();

  console.log('Sort sample:');
  const arr = [5, 3, 9, 1, 4, 8, 2];
  console.log(' before:', arr.join(' '));
  const sorted = [...arr].sort((a, b) => a - b);
  console.log(' after: ', sorted.join(' '));
  console.log();
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function runRandomizedTests(cases: number) {
  console.log(`-- Randomized tests (${cases}) --\n`);

  for (let c = 1; c <= cases; c++) {
    console.log(`Case #${c}`);

    const n = randInt(0, 12);
    console.log(`  factorial(${n}) = ${factorial(n)}`);

    const p = randInt(1, 200);
    console.log(`  ${p} ${isPrime(p) ? 'is prime' : 'is not prime'}`);

    const len = randInt(3, 8);
    const arr = Array.from({ length: len }, () => randInt(0, 100));
    console.log('  random array before:', arr.join(' '));
    const sorted = [...arr].sort((a, b) => a - b);
    console.log('  random array after: ', sorted.join(' '));
    console.log();
  }
}

async function interactiveEcho() {
  console.log('-- Interactive echo test (type a line, Ctrl+D to skip) --');

  process.stdin.setEncoding('utf8');

  const input = await new Promise<string | null>((resolve) => {
    process.stdin.once('data', (chunk) => resolve(chunk.toString().trim()));
    process.stdin.once('end', () => resolve(null));
  });

  if (input) console.log('You typed:', input);
  else console.log('(no interactive input detected)');

  console.log();
}

// --- main ---
(async function main() {
  printHeader();
  runFixedChecks();

  let cases = 0;
  const arg = process.argv.find((a) => a.startsWith('--cases'));
  if (arg) {
    if (arg.includes('=')) cases = parseInt(arg.split('=')[1], 10) || 0;
    else {
      const idx = process.argv.indexOf(arg);
      if (idx !== -1 && process.argv[idx + 1]) {
        cases = parseInt(process.argv[idx + 1], 10) || 0;
      }
    }
  }

  if (cases > 0) runRandomizedTests(cases);

  await interactiveEcho();
  console.log(
    'Done. If you want a smaller/faster version or ESM-compatible version, tell me.'
  );
})();
