import { clearReceipts, listReceipts, saveReceipt } from './db';
import type { Receipt } from './types';
import { sha256 } from './utils';

const SAMPLE_RECEIPT_URL = '/assets/north-yard-sample-receipt-d45ecb57.png';
const DEMO_SEEDED_KEY = 'demo:billable-split:seeded';

export async function sampleReceipt(): Promise<Receipt> {
  const response = await fetch(SAMPLE_RECEIPT_URL);
  if (!response.ok) throw new Error('The sample receipt image could not be loaded. Reload and try again.');
  const blob = await response.blob();
  const now = '2026-08-28T09:30:00.000Z';
  return {
    id: 'demo-north-yard-2026-08-28', supplier: 'North Yard Supply', purchasedOn: '2026-08-26', currency: 'USD', totalCents: 50175,
    note: 'Material receipt split between three active jobs.',
    image: { blob, filename: 'north-yard-sample-receipt.png', mime: 'image/png', sha256: await sha256(blob) },
    lines: [
      { id: 'demo-plywood', description: '12mm plywood sheets', amountCents: 30000, allocations: [
        { id: 'demo-oak-plywood', job: 'Oak Street kitchen', amountCents: 22000, type: 'billable' },
        { id: 'demo-pine-plywood', job: 'Pine Avenue repair', amountCents: 8000, type: 'reimbursable' },
      ] },
      { id: 'demo-fasteners', description: 'Exterior screws and anchors', amountCents: 12675, allocations: [
        { id: 'demo-oak-fasteners', job: 'Oak Street kitchen', amountCents: 12675, type: 'billable' },
      ] },
      { id: 'demo-safety', description: 'Safety gloves', amountCents: 7500, allocations: [
        { id: 'demo-shop-gloves', job: 'Workshop stock', amountCents: 7500, type: 'non-billable' },
      ] },
    ],
    history: [{ id: 'demo-seed', at: now, label: 'Sample receipt loaded' }], createdAt: now, updatedAt: now,
  };
}

export async function seedDemo(force = false): Promise<Receipt[]> {
  if (force) {
    await clearReceipts();
    localStorage.removeItem(DEMO_SEEDED_KEY);
  }
  const current = await listReceipts();
  if (current.length) return current;
  if (localStorage.getItem(DEMO_SEEDED_KEY) === '1') return [];
  const receipt = await sampleReceipt();
  await saveReceipt(receipt);
  localStorage.setItem(DEMO_SEEDED_KEY, '1');
  return [receipt];
}

/** Remove only the demo's local marker when the visitor leaves the sandbox. */
export function discardDemoState(): void {
  localStorage.removeItem(DEMO_SEEDED_KEY);
}
