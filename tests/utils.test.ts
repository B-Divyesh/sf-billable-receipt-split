import { describe, expect, it } from 'vitest';
import type { Receipt } from '../src/types';
import { cents, csvForJob, isReceiptExportable, jobsFor, receiptStatus, validateReceiptImage } from '../src/utils';

function sampleReceipt(): Receipt {
  return {
    id: 'r1', supplier: 'North Yard Supply', purchasedOn: '2026-08-28', currency: 'USD', totalCents: 12500, note: '',
    image: { blob: new Blob(['receipt']), filename: 'receipt.jpg', mime: 'image/jpeg', sha256: 'abc123' },
    lines: [
      { id: 'l1', description: 'Plywood', amountCents: 10000, allocations: [
        { id: 'a1', job: 'Oak Street', amountCents: 7500, type: 'billable' },
        { id: 'a2', job: 'Shop overhead', amountCents: 2500, type: 'non-billable' },
      ] },
      { id: 'l2', description: 'Fasteners', amountCents: 2500, allocations: [
        { id: 'a3', job: 'Oak Street', amountCents: 2500, type: 'reimbursable' },
      ] },
    ], history: [], createdAt: '2026-08-28T00:00:00Z', updatedAt: '2026-08-28T00:00:00Z',
  };
}

describe('allocation evidence', () => {
  it('reports a fully balanced receipt as ready', () => {
    expect(receiptStatus(sampleReceipt())).toEqual({ label: 'Ready to export', className: 'status-ready', remaining: 0 });
    expect(isReceiptExportable(sampleReceipt())).toBe(true);
  });

  it('does not let an over-allocated line cancel against a source-total gap', () => {
    const receipt = sampleReceipt();
    receipt.totalCents = 10_000;
    receipt.lines[0].amountCents = 4_000;
    receipt.lines[0].allocations = [
      { id: 'a1', job: 'Oak Street', amountCents: 4_000, type: 'billable' },
      { id: 'a2', job: 'Oak Street', amountCents: 2_000, type: 'reimbursable' },
    ];
    receipt.lines[1].amountCents = 4_000;
    receipt.lines[1].allocations = [{ id: 'a3', job: 'Shop', amountCents: 4_000, type: 'non-billable' }];

    expect(receiptStatus(receipt)).toEqual({
      label: 'Invalid · $20.00 over lines',
      className: 'status-invalid',
      remaining: -2_000,
    });
    expect(isReceiptExportable(receipt)).toBe(false);
  });

  it('reports money still missing from the source total', () => {
    const receipt = sampleReceipt();
    receipt.lines[1].allocations = [];
    expect(receiptStatus(receipt).remaining).toBe(2500);
  });

  it('lists unique jobs and exports only the selected job with source hash', () => {
    const receipt = sampleReceipt();
    expect(jobsFor(receipt)).toEqual(['Oak Street', 'Shop overhead']);
    const csv = csvForJob(receipt, 'Oak Street');
    expect(csv).toContain('"Source image tamper-check (SHA-256)","abc123"');
    expect(csv).toContain('"Plywood","75.00","billable"');
    expect(csv).toContain('"Fasteners","25.00","reimbursable"');
    expect(csv).not.toContain('Shop overhead');
  });
});

describe('financial input', () => {
  it('parses the largest safe cent amount exactly and rejects larger accepted-looking values', () => {
    expect(cents('90071992547409.91')).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => cents('90071992547409.92')).toThrow('no greater than 90071992547409.91');
    expect(() => cents('90071992547409.93')).toThrow('no greater than 90071992547409.91');
    expect(() => cents('12.345')).toThrow('no more than two decimal places');
  });
});

describe('receipt image validation', () => {
  it('rejects non-images and files whose declared MIME does not match their bytes', async () => {
    await expect(validateReceiptImage(new Blob(['not an image'], { type: 'text/plain' }))).rejects.toThrow('valid PNG, JPEG, WebP, or AVIF');
    await expect(validateReceiptImage(new Blob(['not a png'], { type: 'image/png' }))).rejects.toThrow('valid PNG, JPEG, WebP, or AVIF');
  });

  it('accepts matching PNG bytes', async () => {
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await expect(validateReceiptImage(new Blob([png], { type: 'image/png' }))).resolves.toBe('image/png');
  });
});
