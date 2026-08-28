import type { Receipt } from './types';

export const uid = () => crypto.randomUUID();
export const MAX_AMOUNT = '90071992547409.91';
const MAX_CENTS = BigInt(Number.MAX_SAFE_INTEGER);

export function money(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

export function cents(value: FormDataEntryValue | null): number {
  const input = String(value ?? '').trim();
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(input);
  if (!match) throw new Error('Enter a valid amount with no more than two decimal places.');
  const parsed = (BigInt(match[1]) * 100n) + BigInt((match[2] ?? '').padEnd(2, '0'));
  if (parsed < 1n) throw new Error('Enter an amount of at least 0.01.');
  if (parsed > MAX_CENTS) throw new Error(`Enter an amount no greater than ${MAX_AMOUNT}.`);
  return Number(parsed);
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
  const overAllocated = receipt.lines.reduce((sum, line) => {
    const lineAllocated = line.allocations.reduce((subtotal, allocation) => subtotal + allocation.amountCents, 0);
    return sum + Math.max(0, lineAllocated - line.amountCents);
  }, 0);
  if (overAllocated > 0) {
    return { label: `Invalid · ${money(overAllocated, receipt.currency)} over lines`, className: 'status-invalid', remaining: -overAllocated };
  }
  if (lineTotal > receipt.totalCents) {
    const overSource = lineTotal - receipt.totalCents;
    return { label: `Invalid · ${money(overSource, receipt.currency)} over source`, className: 'status-invalid', remaining: -overSource };
  }
  const remaining = receipt.totalCents - allocated;
  if (isReceiptExportable(receipt)) {
    return { label: 'Ready to export', className: 'status-ready', remaining: 0 };
  }
  return { label: `${money(remaining, receipt.currency)} left`, className: 'status-open', remaining };
}

export function isReceiptExportable(receipt: Receipt): boolean {
  if (!Number.isSafeInteger(receipt.totalCents) || receipt.totalCents < 1 || receipt.lines.length === 0) return false;
  const lineTotal = receipt.lines.reduce((sum, line) => sum + line.amountCents, 0);
  if (!Number.isSafeInteger(lineTotal) || lineTotal !== receipt.totalCents) return false;
  return receipt.lines.every((line) => {
    if (!Number.isSafeInteger(line.amountCents) || line.amountCents < 1) return false;
    const allocated = line.allocations.reduce((sum, allocation) => sum + allocation.amountCents, 0);
    return Number.isSafeInteger(allocated)
      && allocated === line.amountCents
      && line.allocations.every((allocation) => Number.isSafeInteger(allocation.amountCents) && allocation.amountCents > 0);
  });
}

export async function validateReceiptImage(file: Blob): Promise<string> {
  const declared = file.type.toLowerCase();
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = String.fromCharCode(...bytes);
  let detected = '';
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii.slice(1, 4) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) detected = 'image/png';
  else if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) detected = 'image/jpeg';
  else if (bytes.length >= 12 && ascii.slice(0, 4) === 'RIFF' && ascii.slice(8, 12) === 'WEBP') detected = 'image/webp';
  else if (bytes.length >= 12 && ascii.slice(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii.slice(8, 12))) detected = 'image/avif';
  const normalizedDeclared = declared === 'image/jpg' ? 'image/jpeg' : declared;
  if (!detected || detected !== normalizedDeclared) {
    throw new Error('Choose a valid PNG, JPEG, WebP, or AVIF receipt image.');
  }
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width < 1 || bitmap.height < 1) throw new Error('empty image');
      bitmap.close();
    } catch {
      throw new Error('That receipt image is damaged or cannot be displayed. Choose another image.');
    }
  }
  return detected;
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
