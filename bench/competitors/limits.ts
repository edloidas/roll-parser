/**
 * Safety-limit probe: does the library reject absurd pools, or try to roll
 * them? Each (library, input) pair runs in its own child process under a hard
 * timeout, because libraries without roll caps genuinely hang here.
 */

const CASES = ['99999999d99999999', '10000d6'];
const TIMEOUT_MS = 5000;

const SNIPPETS: Record<string, string> = {
  'roll-parser': `import { roll } from '../../src/index.js'; console.log(roll(INPUT).total);`,
  'rpg-dice-roller': `import { DiceRoll } from '@dice-roller/rpg-dice-roller'; console.log(new DiceRoll(INPUT).total);`,
  'randsum/roller': `import { roll } from '@randsum/roller'; console.log(roll(INPUT).total);`,
  'dice-roller-parser': `import { DiceRoller } from 'dice-roller-parser'; console.log(new DiceRoller().rollValue(INPUT));`,
  'airjp73/dice-notation': `import { roll } from '@airjp73/dice-notation'; console.log(roll(INPUT).result);`,
  'dice-typescript': `import { Dice } from 'dice-typescript'; const r = new Dice().roll(INPUT); if (r.errors.length) throw new Error(r.errors[0].message); console.log(r.total);`,
  droll: `import { roll } from 'droll'; const r = roll(INPUT); console.log(r === false ? 'REJECTED(false)' : r.total);`,
};

for (const input of CASES) {
  console.log(`\n### input: ${input}`);
  for (const [name, snippet] of Object.entries(SNIPPETS)) {
    const code = snippet.replaceAll('INPUT', JSON.stringify(input));
    const child = Bun.spawn(['bun', '-e', code], {
      cwd: import.meta.dir,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const timer = setTimeout(() => child.kill('SIGKILL'), TIMEOUT_MS);
    const startedAt = performance.now();
    const exitCode = await child.exited;
    clearTimeout(timer);
    const elapsedMs = Math.round(performance.now() - startedAt);

    let verdict: string;
    if (exitCode === 0) {
      const stdout = (await new Response(child.stdout).text()).trim();
      verdict = `completed in ${elapsedMs}ms -> ${stdout.slice(0, 40)}`;
    } else if (elapsedMs >= TIMEOUT_MS - 100) {
      verdict = `HUNG (killed after ${TIMEOUT_MS}ms)`;
    } else {
      const stderr = (await new Response(child.stderr).text()).trim();
      const firstErrorLine =
        stderr.split('\n').find((line) => line.toLowerCase().includes('error')) ?? '';
      verdict = `threw in ${elapsedMs}ms: ${firstErrorLine.slice(0, 80)}`;
    }
    console.log(`  ${name.padEnd(22)} ${verdict}`);
  }
}
