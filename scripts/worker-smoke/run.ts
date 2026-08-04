/**
 * Executes the worker-smoke fixture in workerd and asserts what it rolled.
 *
 * `wrangler dev` runs workerd locally, so no Cloudflare account is involved. The
 * pinned total is asserted exactly; the seeded total only has to be a plausible
 * `2d6`, because the seed to dice mapping may move in a minor release.
 *
 * Run from the directory holding the fixture's `node_modules`, so that
 * `roll-parser` resolves to the installed tarball:
 *   node scripts/worker-smoke/run.ts
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { join } from 'node:path';

const EXPECTED_PINNED = 14;
const BOOT_TIMEOUT_MS = 120_000;
const REQUEST_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findFreePort(): Promise<number> {
  const server = createServer();
  try {
    return await new Promise<number>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (address === null || typeof address === 'string') {
          reject(new Error('Server did not report a bound port.'));
          return;
        }
        resolve(address.port);
      });
    });
  } finally {
    server.close();
  }
}

const port = await findFreePort();
const wranglerBin = join(import.meta.dirname, 'node_modules', '.bin', 'wrangler');
const configPath = join(import.meta.dirname, 'wrangler.jsonc');

const child = spawn(
  wranglerBin,
  ['dev', '--config', configPath, '--ip', '127.0.0.1', '--port', String(port)],
  {
    // ! wrangler runs workerd as a grandchild — only a group kill reaches it.
    detached: true,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' },
  },
);

let exited = false;
child.on('exit', () => {
  exited = true;
});

// ! Fires even once wrangler has exited: it can die after spawning workerd, and
// ! the surviving grandchild still holds the port.
function stop(): void {
  if (child.pid === undefined) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    // ESRCH — the group is already gone, which is what stop() wanted.
  }
}

function fail(reason: string): never {
  stop();
  console.error(`Worker execution failed: ${reason}`);
  process.exit(1);
}

// ! wrangler's proxy listens before workerd is ready and buffers requests, so a
// ! wedged boot answers neither way — without the abort the poll loop parks
// ! inside one fetch and never re-checks the deadline.
async function fetchOnce(): Promise<Response | undefined> {
  try {
    return await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return undefined;
  }
}

const deadline = Date.now() + BOOT_TIMEOUT_MS;
let response: Response | undefined;
while (response === undefined) {
  if (exited) fail('wrangler dev exited before the Worker answered.');
  if (Date.now() > deadline) fail(`no response from workerd within ${BOOT_TIMEOUT_MS}ms.`);
  response = await fetchOnce();
  if (response === undefined) await delay(POLL_INTERVAL_MS);
}

if (!response.ok) {
  fail(`workerd returned ${response.status}: ${await response.text()}`);
}

const body = (await response.json()) as { version?: unknown; pinned?: unknown; seeded?: unknown };

if (typeof body.version !== 'string' || body.version.length === 0) {
  fail(`VERSION did not cross the Worker boundary: ${JSON.stringify(body.version)}`);
}
if (body.pinned !== EXPECTED_PINNED) {
  fail(`pinned total ${JSON.stringify(body.pinned)}, expected ${EXPECTED_PINNED}`);
}
if (
  typeof body.seeded !== 'number' ||
  !Number.isInteger(body.seeded) ||
  body.seeded < 2 ||
  body.seeded > 12
) {
  fail(`seeded 2d6 total outside 2-12: ${JSON.stringify(body.seeded)}`);
}

stop();
console.log(`Worker execution OK (workerd) ${body.version} ${body.pinned} ${body.seeded}`);
// ! The child handle and its inherited stdio keep the event loop alive, so a
// ! wrangler that stalls in graceful shutdown would hang the step.
process.exit(0);
