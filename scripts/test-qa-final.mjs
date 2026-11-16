import { spawn } from 'child_process';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        return data.webSocketDebuggerUrl;
      }
    } catch (e) {
      await wait(300);
    }
  }
  throw new Error("Could not connect to Chrome CDP");
}

async function run() {
  console.log("=== STARTING INDEPENDENT QA AUTOMATED AUDIT ===");
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  const auditResults = {
    testsPassed: 0,
    testsFailed: 0,
    details: []
  };

  function record(name, passed, info) {
    if (passed) {
      auditResults.testsPassed++;
      console.log(`[PASS] ${name}: ${info}`);
    } else {
      auditResults.testsFailed++;
      console.error(`[FAIL] ${name}: ${info}`);
    }
    auditResults.details.push({ name, passed, info });
  }

  try {
    await getWsUrl();
    const newPageRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:4173/', { method: 'PUT' });
    const pageData = await newPageRes.json();
    const ws = new WebSocket(pageData.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let msgId = 1;
    const callbacks = new Map();
    const consoleErrors = [];
    const networkFailures = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        cb(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(msg.params.exceptionDetails.text + ': ' + msg.params.exceptionDetails.exception?.description);
      }
      if (msg.method === 'Network.loadingFailed') {
        networkFailures.push(msg.params.errorText + ' ' + msg.params.requestId);
      }
      if (msg.method === 'Network.responseReceived') {
        if (msg.params.response.status >= 400) {
          networkFailures.push(`HTTP ${msg.params.response.status} on ${msg.params.response.url}`);
        }
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');

    // TEST 1: Home Page Loading & Metadata
    await send('Page.navigate', { url: 'http://localhost:4173/' });
    await wait(800);
    const titleRes = await send('Runtime.evaluate', { expression: 'document.title' });
    record("TEST 1: Home Page Title & Metadata", titleRes.result.value.includes("NextLevel Weather"), `Title is "${titleRes.result.value}"`);

    // TEST 2: Direct /weather Route Navigation without state
    await send('Page.navigate', { url: 'http://localhost:4173/weather' });
    await wait(800);
    const urlAfterWeatherDirect = await send('Runtime.evaluate', { expression: 'window.location.pathname' });
    const textAfterWeatherDirect = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    const noCrashOnDirectWeather = !textAfterWeatherDirect.result.value.includes("Unexpected Application Error") && urlAfterWeatherDirect.result.value === "/";
    record("TEST 2: Direct /weather Route Redirect", noCrashOnDirectWeather, `Safely redirected to "${urlAfterWeatherDirect.result.value}" without crash`);

    // TEST 3: Unknown 404 Route Catch-all
    await send('Page.navigate', { url: 'http://localhost:4173/invalid-unknown-route-1234' });
    await wait(800);
    const urlAfter404 = await send('Runtime.evaluate', { expression: 'window.location.pathname' });
    const textAfter404 = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    const noCrashOn404 = !textAfter404.result.value.includes("Unexpected Application Error") && urlAfter404.result.value === "/";
    record("TEST 3: 404 Catch-All Route Redirect", noCrashOn404, `Safely handled unknown route, redirected to "${urlAfter404.result.value}"`);

    // TEST 4A: Open Location Modal
    await send('Runtime.evaluate', { expression: `document.querySelector('button').click();` });
    await wait(400);
    const modalOpen = await send('Runtime.evaluate', {
      expression: `document.body.innerText.includes('Where are you today?')`
    });
    record("TEST 4A: Location Modal Opens", modalOpen.result.value === true, "Modal displayed");

    // TEST 4B: Close via X button
    await send('Runtime.evaluate', {
      expression: `document.querySelector('button[aria-label="Close modal"]').click();`
    });
    await wait(400);
    const modalClosedX = await send('Runtime.evaluate', {
      expression: `!document.body.innerText.includes('Where are you today?')`
    });
    record("TEST 4B: Location Modal Closes via X", modalClosedX.result.value === true, "Modal closed");

    // TEST 5: Modal Backdrop Click
    await send('Runtime.evaluate', { expression: `document.querySelector('button').click();` });
    await wait(400);
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-testid="modal-backdrop"]').click();`
    });
    await wait(400);
    const modalClosedBackdrop = await send('Runtime.evaluate', {
      expression: `!document.body.innerText.includes('Where are you today?')`
    });
    record("TEST 5: Modal Closes on Backdrop Click", modalClosedBackdrop.result.value === true, "Modal closed on backdrop click");

    // TEST 6: Empty City Submission Validation
    await send('Runtime.evaluate', { expression: `document.querySelector('button').click();` });
    await wait(400);
    await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Get Weather')).click();`
    });
    await wait(400);
    const emptyCityError = await send('Runtime.evaluate', {
      expression: `document.body.innerText.includes('Please enter a city name')`
    });
    record("TEST 6: Empty City Validation Error", emptyCityError.result.value === true, "Validation message displayed in-place");

    // Close modal after Test 6
    await send('Runtime.evaluate', {
      expression: `document.querySelector('button[aria-label="Close modal"]').click();`
    });
    await wait(400);

    // TEST 7: Invalid City Name Submission (Graceful error, no crash)
    await send('Runtime.evaluate', { expression: `document.querySelector('button').click();` });
    await wait(400);
    await send('Runtime.evaluate', {
      expression: `
        const inp = document.querySelector('input');
        inp.click();
        inp.focus();
      `
    });
    await send('Input.insertText', { text: 'xyznonexistentcity99999' });
    await wait(200);
    await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Get Weather')).click();`
    });
    await wait(2500);
    const bodyAfterInvalid = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    const hasGracefulError = bodyAfterInvalid.result.value.includes('not found') && !bodyAfterInvalid.result.value.includes('Unexpected Application Error');
    record("TEST 7: Invalid City Graceful Error (React #31 Fixed)", hasGracefulError, "Graceful inline error without crashing");

    // Close modal after Test 7
    await send('Runtime.evaluate', {
      expression: `document.querySelector('button[aria-label="Close modal"]').click();`
    });
    await wait(400);

    // TEST 8: Valid City Search (Tokyo) & Weather Page Rendering
    await send('Runtime.evaluate', { expression: `document.querySelector('button').click();` });
    await wait(400);
    await send('Runtime.evaluate', {
      expression: `
        const inp = document.querySelector('input');
        inp.click();
        inp.focus();
      `
    });
    await send('Input.insertText', { text: 'Tokyo' });
    await wait(200);
    await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Get Weather')).click();`
    });
    await wait(3000);

    const weatherPageContent = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    const tokyoDisplayed = weatherPageContent.result.value.includes('Tokyo');
    const temperatureDisplayed = /\d+°/.test(weatherPageContent.result.value);
    const recommendationDisplayed = weatherPageContent.result.value.includes('YOUR SMART SUGGESTION') || weatherPageContent.result.value.includes('Your smart suggestion');
    const weatherTypeDisplayed = weatherPageContent.result.value.includes('Live in Tokyo');

    record("TEST 8A: Tokyo Location Displayed", tokyoDisplayed, "Tokyo rendered on weather card");
    record("TEST 8B: Temperature Displayed", temperatureDisplayed, "Valid temperature rendered");
    record("TEST 8C: Recommendation Card Displayed", recommendationDisplayed, "Smart recommendation rendered");
    record("TEST 8D: Weather Scene / Type Displayed", weatherTypeDisplayed, "Live in Tokyo badge and scene rendered");

    // TEST 9: Change Location Modal on Weather Page to Paris
    await send('Runtime.evaluate', {
      expression: `
        const changeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Change location'));
        if (changeBtn) changeBtn.click();
      `
    });
    await wait(500);

    await send('Runtime.evaluate', {
      expression: `
        const inp = document.querySelector('input');
        inp.click();
        inp.focus();
      `
    });
    await send('Input.insertText', { text: 'Paris' });
    await wait(200);
    await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Get Weather')).click();`
    });
    await wait(3000);

    const parisContent = await send('Runtime.evaluate', { expression: 'document.body.innerText' });
    const parisDisplayed = parisContent.result.value.includes('Paris');
    record("TEST 9: Change Location to Paris", parisDisplayed, "Weather updated to Paris successfully");

    // TEST 10: Navigation Back To Home
    await send('Runtime.evaluate', {
      expression: `
        const backLink = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Back To Home'));
        if (backLink) backLink.click();
      `
    });
    await wait(800);
    const homeUrl = await send('Runtime.evaluate', { expression: 'window.location.pathname' });
    record("TEST 10: Back To Home Navigation", homeUrl.result.value === "/", "Navigated back to Home");

    // TEST 11: Mobile Responsiveness Check (375x667)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await wait(400);

    // Open modal on mobile
    await send('Runtime.evaluate', { expression: `document.querySelector('button').click();` });
    await wait(400);

    const overflowCheck = await send('Runtime.evaluate', {
      expression: `
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        const modal = document.querySelector('[data-testid="modal-container"]');
        const modalRect = modal ? modal.getBoundingClientRect() : null;
        ({
          scrollW,
          clientW,
          hasHOverflow: scrollW > clientW,
          modalWidth: modalRect ? modalRect.width : 0
        })
      `,
      returnByValue: true
    });

    const mobilePass = !overflowCheck.result.value.hasHOverflow && overflowCheck.result.value.modalWidth <= 375;
    record("TEST 11: Mobile Responsiveness (375px viewport)", mobilePass,
      `scrollW: ${overflowCheck.result.value.scrollW}, clientW: ${overflowCheck.result.value.clientW}, modalWidth: ${overflowCheck.result.value.modalWidth}px`
    );

    // Close modal
    await send('Runtime.evaluate', {
      expression: `document.querySelector('button[aria-label="Close modal"]').click();`
    });
    await wait(300);

    // TEST 12: Console Errors & Network Failures
    record("TEST 12A: Browser Console Errors", consoleErrors.length === 0,
      consoleErrors.length === 0 ? "Zero console errors logged" : `Logged errors: ${consoleErrors.join('; ')}`
    );
    record("TEST 12B: Network Failures (4xx / 5xx)", networkFailures.length === 0,
      networkFailures.length === 0 ? "Zero network failures detected" : `Failed requests: ${networkFailures.join('; ')}`
    );

    console.log("\n=== AUDIT RESULTS SUMMARY ===");
    console.log(`Total Passed: ${auditResults.testsPassed} / ${auditResults.testsPassed + auditResults.testsFailed}`);
    console.log(`Total Failed: ${auditResults.testsFailed}`);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(console.error);
