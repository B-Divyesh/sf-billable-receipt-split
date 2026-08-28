import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const RECEIPT_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

test('creates, splits, persists, and works offline', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('button', { name: 'Add a receipt' }).click();
  await page.getByLabel('Choose receipt image').setInputFiles({
    name: 'yard-receipt.png', mimeType: 'image/png',
    buffer: RECEIPT_PNG,
  });
  await page.getByLabel('Supplier').fill('North Yard Supply');
  await page.getByLabel('Receipt total').fill('42.50');
  await page.getByRole('button', { name: /Fingerprint & continue/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('North Yard Supply');
  await page.getByLabel('Line description').fill('Plywood');
  await page.getByLabel('Line total').last().fill('42.50');
  await page.getByRole('button', { name: /Add line/ }).click();
  await page.getByPlaceholder('e.g. Oak Street kitchen').fill('Oak Street kitchen');
  await page.locator('form.new-allocation').getByLabel('Amount').fill('42.50');
  await page.getByRole('button', { name: 'Add split' }).click();
  await expect(page.getByText('Ready to export').first()).toBeVisible();
  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /CSV/ }).click();
  expect((await csvDownload).suggestedFilename()).toContain('oak-street-kitchen');
  await page.reload();
  await page.getByRole('button', { name: /North Yard Supply/ }).click();
  await expect(page.getByText('Oak Street kitchen').first()).toBeVisible();
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Offline mode/).first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('One receipt');
  await page.getByRole('button', { name: /North Yard Supply/ }).click();
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /PDF/ }).click();
  expect((await pdfDownload).suggestedFilename()).toContain('oak-street-kitchen');
  expect(errors).toEqual([]);
});

test('downloads an encrypted local backup', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a receipt' }).click();
  await page.getByLabel('Choose receipt image').setInputFiles({
    name: 'backup-receipt.png', mimeType: 'image/png',
    buffer: RECEIPT_PNG,
  });
  await page.getByLabel('Supplier').fill('Backup Supply');
  await page.getByLabel('Receipt total').fill('10.00');
  await page.getByRole('button', { name: /Fingerprint & continue/ }).click();
  await page.getByRole('button', { name: 'All receipts' }).click();
  await page.getByRole('button', { name: 'Data & license' }).click();
  await page.getByRole('region', { name: 'Encrypted backup' }).getByLabel('Backup password').fill('correct-horse-battery');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download encrypted backup/ }).click();
  const backup = await download;
  expect(backup.suggestedFilename()).toMatch(/\.billsplit$/);
  const backupPath = await backup.path();
  expect(backupPath).not.toBeNull();
  await page.getByRole('button', { name: 'Billable Split home' }).click();
  await page.getByRole('button', { name: /Backup Supply/ }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByText('No receipts on this device')).toBeVisible();
  await page.getByRole('button', { name: 'Data & license' }).click();
  const restore = page.getByRole('region', { name: 'Restore backup' });
  await restore.getByLabel('Backup file').setInputFiles(backupPath!);
  await restore.getByLabel('Backup password').fill('correct-horse-battery');
  page.once('dialog', (dialog) => dialog.accept());
  await restore.getByRole('button', { name: 'Check & restore backup' }).click();
  await expect(page.getByRole('button', { name: /Backup Supply/ })).toBeVisible();
});

test('has keyboard-visible landmarks and legal links', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to main content')).toBeFocused();
  await expect(page.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  for (const target of [page.getByRole('button', { name: 'Billable Split home' }), page.getByRole('link', { name: 'Privacy' }), page.getByRole('link', { name: 'Terms' })]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  const openDialog = page.getByRole('button', { name: 'Add a receipt' });
  await openDialog.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close new receipt dialog' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(openDialog).toBeFocused();

  await page.getByRole('button', { name: 'Data & license' }).click();
  const settingsResults = await new AxeBuilder({ page }).analyze();
  expect(settingsResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.goto('/privacy/');
  const privacyResults = await new AxeBuilder({ page }).analyze();
  expect(privacyResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.goto('/terms/');
  const termsResults = await new AxeBuilder({ page }).analyze();
  expect(termsResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('rejects unsafe money and non-image receipt sources', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a receipt' }).click();
  await page.getByLabel('Choose receipt image').setInputFiles({ name: 'receipt.png', mimeType: 'image/png', buffer: RECEIPT_PNG });
  await page.getByLabel('Supplier').fill('Precision Supply');
  await page.getByLabel('Receipt total').fill('90071992547409.93');
  await page.locator('form[data-action="create-receipt"]').evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
    form.requestSubmit();
  });
  await expect(page.getByText('Enter an amount no greater than 90071992547409.91.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Capture the receipt' })).toBeVisible();

  await page.getByLabel('Receipt total').fill('10.00');
  await page.getByLabel('Choose receipt image').setInputFiles({ name: 'not-an-image.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await page.getByRole('button', { name: /Fingerprint & continue/ }).click();
  await expect(page.getByText('Choose a valid PNG, JPEG, WebP, or AVIF receipt image.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Capture the receipt' })).toBeVisible();
});

test('rejects a line total below its allocations and disables exports for legacy-invalid data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add a receipt' }).click();
  await page.getByLabel('Choose receipt image').setInputFiles({ name: 'allocation-receipt.png', mimeType: 'image/png', buffer: RECEIPT_PNG });
  await page.getByLabel('Supplier').fill('Integrity Supply');
  await page.getByLabel('Receipt total').fill('100.00');
  await page.getByRole('button', { name: /Fingerprint & continue/ }).click();

  await page.getByLabel('Line description').fill('Shared materials');
  await page.getByLabel('Line total').last().fill('60.00');
  await page.getByRole('button', { name: /Add line/ }).click();
  let split = page.locator('form.new-allocation').first();
  await split.getByLabel('Job').fill('Oak Street');
  await split.getByLabel('Amount').fill('40.00');
  await split.getByRole('button', { name: 'Add split' }).click();
  split = page.locator('form.new-allocation').first();
  await split.getByLabel('Job').fill('Pine Avenue');
  await split.getByLabel('Amount').fill('20.00');
  await split.getByRole('button', { name: 'Add split' }).click();

  await page.getByLabel('Line description').fill('Fasteners');
  await page.getByLabel('Line total').last().fill('40.00');
  await page.getByRole('button', { name: /Add line/ }).click();
  split = page.locator('form.new-allocation').nth(1);
  await split.getByLabel('Job').fill('Shop overhead');
  await split.getByLabel('Amount').fill('40.00');
  await split.getByRole('button', { name: 'Add split' }).click();
  await expect(page.getByText('Ready to export').first()).toBeVisible();

  const editLine = page.locator('form.edit-line').first();
  await editLine.getByLabel('Line total').fill('40.00');
  await editLine.getByRole('button', { name: 'Save line' }).click();
  await expect(page.getByText('Line total cannot be less than its $60.00 of allocations. Reconcile the splits first.')).toBeVisible();

  await page.getByRole('button', { name: 'All receipts' }).click();
  await page.getByRole('button', { name: /Integrity Supply/ }).click();
  await expect(page.locator('form.edit-line').first().getByLabel('Line total')).toHaveValue('60.00');

  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('billable-split');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const receipt = await new Promise<any>((resolve, reject) => {
      const request = database.transaction('receipts').objectStore('receipts').getAll();
      request.onsuccess = () => resolve(request.result[0]);
      request.onerror = () => reject(request.error);
    });
    receipt.lines[0].amountCents = 4_000;
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('receipts', 'readwrite');
      transaction.objectStore('receipts').put(receipt);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
  await page.reload();
  await page.getByRole('button', { name: /Integrity Supply/ }).click();
  await expect(page.getByText('Invalid · $20.00 over lines').first()).toBeVisible();
  await expect(page.getByText('Balance every line and the source total before exporting evidence.')).toBeVisible();
  await expect(page.getByRole('button', { name: /CSV/ }).first()).toBeDisabled();
  await expect(page.getByRole('button', { name: /PDF/ }).first()).toBeDisabled();
});

test('removes superseded service-worker caches', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await page.evaluate(async () => { await caches.open('billable-split-v8'); });
  await expect.poll(() => page.evaluate(() => caches.keys())).toContain('billable-split-v8');
  await page.reload();
  await expect.poll(() => page.evaluate(() => caches.keys())).toEqual(['billable-split-v10']);
});
