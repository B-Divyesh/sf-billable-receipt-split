import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

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
  await page.goto('/demo');
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const open = indexedDB.open('demo:billable-split'); open.onsuccess = () => resolve(open.result); open.onerror = () => reject(open.error); });
    const items = await new Promise<any[]>((resolve, reject) => { const get = db.transaction('receipts').objectStore('receipts').getAll(); get.onsuccess = () => resolve(get.result); get.onerror = () => reject(get.error); });
    const base = items[0]; const tx = db.transaction('receipts', 'readwrite');
    for (let count = 2; count <= 5; count += 1) tx.objectStore('receipts').put({ ...base, id: `demo-limit-${count}`, supplier: `Sample receipt ${count}`, updatedAt: `2026-08-28T09:3${count}:00.000Z` });
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close();
  });
  await page.reload();
  await page.getByRole('link', { name: 'All receipts' }).click();
  await page.getByRole('button', { name: 'Add receipt' }).click();
  await expect(page).toHaveURL(/\/demo\/settings$/);
  await expect(page.getByText('The free archive is full. Export or delete a receipt, or unlock unlimited storage.')).toBeVisible();
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
