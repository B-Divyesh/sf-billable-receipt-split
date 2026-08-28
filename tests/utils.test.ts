import { describe, expect, it } from 'vitest';
import type { Receipt } from '../src/types';
import { csvForJob, jobsFor, receiptStatus } from '../src/utils';

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
    expect(csv).toContain('"Source image SHA-256","abc123"');
    expect(csv).toContain('"Plywood","75.00","billable"');
    expect(csv).toContain('"Fasteners","25.00","reimbursable"');
    expect(csv).not.toContain('Shop overhead');
  });
});
