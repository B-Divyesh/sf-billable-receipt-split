import type { Receipt } from './types';

export const uid = () => crypto.randomUUID();

export function money(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

export function cents(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sha256(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function receiptStatus(receipt: Receipt): { label: string; className: string; remaining: number } {
  const lineTotal = receipt.lines.reduce((sum, line) => sum + line.amountCents, 0);
  const allocated = receipt.lines.reduce(
    (sum, line) => sum + line.allocations.reduce((subtotal, allocation) => subtotal + allocation.amountCents, 0),
    0,
  );
  const lineGap = receipt.totalCents - lineTotal;
  const allocationGap = lineTotal - allocated;
  const remaining = lineGap + allocationGap;
  if (receipt.lines.length > 0 && lineGap === 0 && allocationGap === 0) {
    return { label: 'Ready to export', className: 'status-ready', remaining: 0 };
  }
  return { label: `${money(Math.abs(remaining), receipt.currency)} ${remaining < 0 ? 'over' : 'left'}`, className: 'status-open', remaining };
}

export function jobsFor(receipt: Receipt): string[] {
  return [...new Set(receipt.lines.flatMap((line) => line.allocations.map((allocation) => allocation.job.trim())).filter(Boolean))].sort();
}

export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function safeFilename(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'job';
}

export function csvForJob(receipt: Receipt, job: string): string {
  const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ['Source supplier', receipt.supplier],
    ['Purchase date', receipt.purchasedOn],
    ['Source receipt total', (receipt.totalCents / 100).toFixed(2)],
    ['Currency', receipt.currency],
    ['Source image SHA-256', receipt.image.sha256],
    ['Job', job],
    [],
    ['Line description', 'Allocation amount', 'Cost status', 'Source line amount'],
  ];
  for (const line of receipt.lines) {
    for (const allocation of line.allocations.filter((item) => item.job === job)) {
      rows.push([line.description, (allocation.amountCents / 100).toFixed(2), allocation.type, (line.amountCents / 100).toFixed(2)]);
    }
  }
  return rows.map((row) => row.map(quote).join(',')).join('\r\n');
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(blob);
  });
}

export async function imageToJpegDataUrl(blob: Blob): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.78);
  } catch {
    return null;
  }
}
