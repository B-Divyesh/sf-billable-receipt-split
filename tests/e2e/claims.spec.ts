import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function fillFreeSampleArchive(page: Page, idPrefix: string): Promise<void> {
  await expect(page.getByRole('heading', { name: 'North Yard Supply' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local storage is unavailable' })).toHaveCount(0);

  const seed = await page.evaluate(async ({ idPrefix }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open('demo:billable-split');
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    const items = await new Promise<any[]>((resolve, reject) => {
      const get = db.transaction('receipts').objectStore('receipts').getAll();
      get.onsuccess = () => resolve(get.result);
      get.onerror = () => reject(get.error);
    });
    const base = items[0];
    if (!base || base.id !== 'demo-north-yard-2026-08-28' || !Array.isArray(base.lines)) {
      db.close();
      throw new Error('The complete North Yard Supply sample was not ready.');
    }
    const transaction = db.transaction('receipts', 'readwrite');
    for (let count = 2; count <= 5; count += 1) {
      transaction.objectStore('receipts').put({
        ...base,
        id: `${idPrefix}-${count}`,
        supplier: `Sample receipt ${count}`,
        updatedAt: `2026-08-28T09:3${count}:00.000Z`,
      });
    }
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    return { id: base.id, lineCount: base.lines.length };
  }, { idPrefix });

  expect(seed).toEqual({ id: 'demo-north-yard-2026-08-28', lineCount: 3 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Local storage is unavailable' })).toHaveCount(0);
}

test('@claim:source-retention shows the sample source image and tamper-check value', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'North Yard Supply' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Source receipt from North Yard Supply/ })).toBeVisible();
  await expect(page.locator('.source-meta dd').last()).toHaveText(/^[a-f0-9]{64}$/);
});

test('@claim:job-allocation shows one receipt split between three named jobs', async ({ page }) => {
  await page.goto('/demo');
  for (const job of ['Oak Street kitchen', 'Pine Avenue repair', 'Workshop stock']) await expect(page.getByText(job).first()).toBeVisible();
  await expect(page.getByText('Ready to export').first()).toBeVisible();
});

test('@claim:csv-export downloads job rows from the sample receipt', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /^CSV/ }).first().click();
  const file = await download;
  expect(file.suggestedFilename()).toContain('oak-street-kitchen');
  expect(await readFile((await file.path())!, 'utf8')).toContain('North Yard Supply');
});

test('@claim:pdf-export downloads a PDF for the sample job', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /^PDF/ }).first().click();
  expect((await download).suggestedFilename()).toContain('oak-street-kitchen');
});

test('@claim:free-receipt-limit blocks a sixth receipt and offers recovery', async ({ page }) => {
  await page.goto('/demo?free=1');
  await fillFreeSampleArchive(page, 'demo-limit');
  await page.getByRole('link', { name: 'All receipts' }).click();
  await expect(page.getByText('Saved receipts: 5')).toBeVisible();
  await page.getByRole('button', { name: 'Add receipt' }).click();
  await expect(page).toHaveURL(/\/demo\/settings\?free=1$/);
  await expect(page.getByText('The five-receipt sample archive is full')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local storage is unavailable' })).toHaveCount(0);
});

test('@claim:receipt-data-local keeps demo storage isolated and sends no receipt data away', async ({ page, context }, testInfo) => {
  const origin = new URL(String(testInfo.project.use.baseURL)).origin;
  const external: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== origin) external.push(request.url()); });
  await page.goto('/demo');
  const names = await page.evaluate(async () => (await indexedDB.databases()).map(database => database.name));
  expect(names).toContain('demo:billable-split');
  expect(names).not.toContain('billable-split');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /^CSV/ }).first().click();
  await download;
  expect(external).toEqual([]);
  await context.clearCookies();
});

test('@claim:offline-reload reloads the demo and exports while offline', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'North Yard Supply' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /^PDF/ }).first().click();
  expect((await download).suggestedFilename()).toContain('.pdf');
});

test('@claim:license-removes-limit lets a $19 sample license add a sixth receipt while free exports work', async ({ page }) => {
  await page.goto('/demo?free=1');
  await fillFreeSampleArchive(page, 'sample-license');
  const freeDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /^CSV/ }).first().click();
  expect((await freeDownload).suggestedFilename()).toContain('.csv');
  await page.getByRole('link', { name: 'All receipts' }).click();
  await expect(page.getByText('Saved receipts: 5')).toBeVisible();
  await page.getByRole('button', { name: 'Add receipt' }).click();
  await expect(page.getByText('The five-receipt sample archive is full')).toBeVisible();

  await page.goto('/demo/list');
  await page.getByRole('button', { name: 'Add receipt' }).click();
  await expect(page.getByRole('heading', { name: 'Capture the receipt' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/demo/settings');
  await expect(page.getByText('Sample archive has no receipt limit')).toBeVisible();
  await expect(page.getByText(/valid \$19 license removes the five-receipt limit/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local storage is unavailable' })).toHaveCount(0);
});

test('@claim:cost-classification keeps every cost status in the sample CSV', async ({ page }) => {
  await page.goto('/demo');
  const buttons = page.getByRole('button', { name: /^CSV/ });
  for (const [index, status] of ['billable', 'reimbursable', 'non-billable'].entries()) {
    const download = page.waitForEvent('download');
    await buttons.nth(index).click();
    const file = await download;
    expect(await readFile((await file.path())!, 'utf8')).toContain(status);
  }
});

test('@claim:pdf-source-evidence writes the source image and tamper-check value into the PDF', async ({ page }) => {
  await page.goto('/demo');
  const fingerprint = await page.locator('.source-meta dd').last().textContent();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /^PDF/ }).first().click();
  const pdfFile = await download;
  const pdf = await readFile((await pdfFile.path())!);
  const source = pdf.toString('latin1');
  expect(source).toContain('/Subtype /Image');
  expect(source).toContain(fingerprint!);
  expect(source).toContain('Source receipt image');
});

test('@claim:receipt-history records a sample edit', async ({ page }) => {
  await page.goto('/demo');
  const form = page.locator('form.edit-line').first();
  await form.getByLabel('Description').fill('12mm plywood sheets — counted');
  await form.getByRole('button', { name: 'Save line' }).click();
  await page.locator('.history-panel summary').click();
  await expect(page.locator('.history-panel').getByText('Receipt line updated')).toBeVisible();
});

test('@claim:permanent-deletion removes a sample receipt after reload', async ({ page }) => {
  await page.goto('/demo');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page).toHaveURL(/\/demo\/list$/);
  await page.reload();
  await expect(page.getByText('No receipts saved yet')).toBeVisible();
  await expect(page.getByRole('button', { name: /North Yard Supply/ })).toHaveCount(0);
});

test('@claim:encrypted-backup downloads encrypted data instead of receipt text', async ({ page }, testInfo) => {
  const external: string[] = [];
  const origin = new URL(String(testInfo.project.use.baseURL)).origin;
  page.on('request', request => { if (new URL(request.url()).origin !== origin) external.push(request.url()); });
  await page.goto('/demo/settings');
  const section = page.getByRole('region', { name: 'Encrypted backup' });
  await section.getByLabel('Backup password').fill('correct-horse-battery');
  const download = page.waitForEvent('download');
  await section.getByRole('button', { name: /Download encrypted backup/ }).click();
  const backupFile = await download;
  const contents = await readFile((await backupFile.path())!, 'utf8');
  expect(contents).toContain('"algorithm":"AES-GCM"');
  expect(contents).not.toContain('North Yard Supply');
  expect(contents).not.toContain('north-yard-sample-receipt.png');
  expect(external).toEqual([]);
});

test('@claim:backup-image-check rejects a mismatched encrypted image and keeps sample data', async ({ page }) => {
  await page.goto('/demo/settings');
  const backup = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const open = indexedDB.open('demo:billable-split'); open.onsuccess = () => resolve(open.result); open.onerror = () => reject(open.error); });
    const receipt = await new Promise<any>((resolve, reject) => { const get = db.transaction('receipts').objectStore('receipts').get('demo-north-yard-2026-08-28'); get.onsuccess = () => resolve(get.result); get.onerror = () => reject(get.error); });
    db.close();
    const bytes = new Uint8Array(await receipt.image.blob.arrayBuffer());
    const encoded = btoa(String.fromCharCode(...bytes));
    const portable = { ...receipt, image: { filename: receipt.image.filename, mime: receipt.image.mime, sha256: '0'.repeat(64), dataUrl: `data:${receipt.image.mime};base64,${encoded}` } };
    const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12));
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode('correct-horse-battery'), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 250000 }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify({ receipts: [portable] }))));
    const base64 = (value: Uint8Array) => btoa(String.fromCharCode(...value));
    return JSON.stringify({ format: 'billable-split-encrypted', version: 1, algorithm: 'AES-GCM', iterations: 250000, salt: base64(salt), iv: base64(iv), ciphertext: base64(ciphertext) });
  });
  const restore = page.getByRole('region', { name: 'Restore backup' });
  await restore.getByLabel('Backup file').setInputFiles({ name: 'mismatched.billsplit', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await restore.getByLabel('Backup password').fill('correct-horse-battery');
  await restore.getByRole('button', { name: 'Check & restore backup' }).click();
  await expect(restore.getByText('A receipt image does not match its tamper-check value. Nothing was restored.')).toBeVisible();
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'North Yard Supply' })).toBeVisible();
});

test('@claim:manual-receipt-entry adds no extracted lines after an image upload', async ({ page }, testInfo) => {
  const external: string[] = [];
  const origin = new URL(String(testInfo.project.use.baseURL)).origin;
  page.on('request', request => { if (new URL(request.url()).origin !== origin) external.push(request.url()); });
  await page.goto('/demo/list');
  await page.getByRole('button', { name: 'Add receipt' }).click();
  await page.getByLabel('Choose receipt image').setInputFiles({ name: 'manual-entry.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') });
  await page.getByLabel('Supplier').fill('Manual Entry Supply');
  await page.getByLabel('Receipt total').fill('10.00');
  await page.getByRole('button', { name: /Save receipt & continue/ }).click();
  await expect(page.getByRole('heading', { name: 'Manual Entry Supply' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add the first receipt line' })).toBeVisible();
  await expect(page.locator('.line-card')).toHaveCount(0);
  expect(external).toEqual([]);
});

test('@claim:demo-isolation resets only sample data and starts with untouched real data', async ({ page }, testInfo) => {
  const external: string[] = [];
  const origin = new URL(String(testInfo.project.use.baseURL)).origin;
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:billable-receipt-split', 'real-license-token');
    localStorage.setItem('sb_license_verdict:billable-receipt-split', JSON.stringify({ valid: true, checkedAt: 0 }));
  });
  page.on('request', request => { if (new URL(request.url()).origin !== origin) external.push(request.url()); });
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Billable Split');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'North Yard Supply' })).toBeVisible();
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const open = indexedDB.open('billable-split', 1); open.onupgradeneeded = () => open.result.createObjectStore('receipts', { keyPath: 'id' }); open.onsuccess = () => resolve(open.result); open.onerror = () => reject(open.error); });
    const transaction = database.transaction('receipts', 'readwrite');
    transaction.objectStore('receipts').put({ id: 'real-receipt', supplier: 'Untouched real receipt', purchasedOn: '2026-08-20', currency: 'USD', totalCents: 100, note: '', image: { blob: new Blob(['real'], { type: 'image/png' }), filename: 'real.png', mime: 'image/png', sha256: '0'.repeat(64) }, lines: [], history: [], createdAt: '2026-08-20T00:00:00.000Z', updatedAt: '2026-08-20T00:00:00.000Z' });
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); }); database.close();
  });
  const sampleLine = page.locator('form.edit-line').first();
  await sampleLine.getByLabel('Description').fill('Changed sample line');
  await sampleLine.getByRole('button', { name: 'Save line' }).click();
  await expect(page.locator('form.edit-line').first().getByLabel('Description')).toHaveValue('Changed sample line');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'North Yard Supply' })).toBeVisible();
  await expect(page.locator('form.edit-line').first().getByLabel('Description')).toHaveValue('12mm plywood sheets');
  await expect(page.locator('input[value="Changed sample line"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByLabel('Demo controls')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Untouched real receipt/ })).toBeVisible();
  await expect(page.evaluate(() => localStorage.getItem('sb_license:billable-receipt-split'))).resolves.toBe('real-license-token');
  await expect(page.evaluate(() => localStorage.getItem('sb_license_verdict:billable-receipt-split'))).resolves.toBe(JSON.stringify({ valid: true, checkedAt: 0 }));
  const remainingDatabases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(remainingDatabases).toContain('billable-split');
  const remainingDemoReceipts = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open('demo:billable-split');
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    const receipts = await new Promise<any[]>((resolve, reject) => {
      const get = database.transaction('receipts').objectStore('receipts').getAll();
      get.onsuccess = () => resolve(get.result);
      get.onerror = () => reject(get.error);
    });
    database.close();
    return receipts.length;
  });
  expect(remainingDemoReceipts).toBe(0);
  expect(external).toEqual([]);
});
