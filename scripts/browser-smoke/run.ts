/**
 * Executes a browser-smoke bundle in real headless Chromium.
 *
 * Serves the bundle as a module script over local HTTP (module scripts
 * misreport errors on file:// and data: origins), then passes only when the
 * fixture's success log appears — and fails on any page error, console error,
 * or unhandled rejection, whichever comes first.
 *
 * Usage: node scripts/browser-smoke/run.ts <bundle.js>
 */
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const SUCCESS_MARKER = 'browser-smoke OK';
const TIMEOUT_MS = 30_000;
// Lets in-flight async failures surface before the run is declared green.
const SETTLE_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const bundlePath = process.argv[2];
if (!bundlePath) {
  console.error('Usage: node scripts/browser-smoke/run.ts <bundle.js>');
  process.exit(1);
}

const bundle = await readFile(bundlePath);

// Chromium reports unhandled rejections as pageerror only for Error reasons;
// this listener surfaces non-Error rejections as console errors.
const harnessHtml = `<!doctype html>
<html>
<head>
<script>
window.addEventListener('unhandledrejection', (event) => {
  console.error('unhandledrejection: ' + event.reason);
});
</script>
<script type="module" src="/bundle.js"></script>
</head>
<body></body>
</html>`;

const server = createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(harnessHtml);
  } else if (req.url === '/bundle.js') {
    res.writeHead(200, { 'content-type': 'text/javascript' });
    res.end(bundle);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const port = await new Promise<number>((resolve, reject) => {
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

const failures: string[] = [];
let reportSuccess = (): void => {};
const successSeen = new Promise<void>((resolve) => {
  reportSuccess = resolve;
});
let reportFailure = (): void => {};
const failureSeen = new Promise<void>((resolve) => {
  reportFailure = resolve;
});

function fail(reason: string): void {
  failures.push(reason);
  reportFailure();
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  context.on('weberror', (webError) => fail(`weberror: ${webError.error().message}`));

  const page = await context.newPage();
  page.on('pageerror', (error) => fail(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      fail(`console.error: ${message.text()}`);
    } else if (message.text().startsWith(SUCCESS_MARKER)) {
      console.log(`Fixture logged: ${message.text()}`);
      reportSuccess();
    }
  });

  // A wedged load would otherwise throw Playwright's navigation timeout past the
  // reporting below.
  try {
    await page.goto(`http://127.0.0.1:${port}/`, { timeout: TIMEOUT_MS });
  } catch (error) {
    fail(`navigation: ${error instanceof Error ? error.message : String(error)}`);
  }

  const result = await Promise.race([
    successSeen.then(() => 'success' as const),
    failureSeen.then(() => 'failure' as const),
    delay(TIMEOUT_MS).then(() => 'timeout' as const),
  ]);
  if (result === 'success') {
    await delay(SETTLE_MS);
  }
  if (result === 'timeout') {
    fail(`timeout: no "${SUCCESS_MARKER}" console log within ${TIMEOUT_MS}ms`);
  }

  if (failures.length > 0) {
    console.error('Browser execution failed:');
    for (const failure of failures) {
      console.error(`  ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Browser execution OK (headless Chromium).');
  }
} finally {
  await browser.close();
  server.close();
}
