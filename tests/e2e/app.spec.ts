import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates, splits, persists, and works offline', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('button', { name: 'Add a receipt' }).click();
  await page.getByLabel('Choose receipt image').setInputFiles({
    name: 'yard-receipt.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
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
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
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
});
