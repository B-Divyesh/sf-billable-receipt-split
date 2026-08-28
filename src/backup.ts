import type { Receipt } from './types';
import { blobToDataUrl, download, sha256, validateReceiptImage } from './utils';

interface PortableReceipt extends Omit<Receipt, 'image'> {
  image: Omit<Receipt['image'], 'blob'> & { dataUrl: string };
}

interface EncryptedBackup {
  format: 'billable-split-encrypted';
  version: 1;
  algorithm: 'AES-GCM';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function keyFromPassword(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function createEncryptedBackup(receipts: Receipt[], password: string): Promise<void> {
  const portable: PortableReceipt[] = await Promise.all(
    receipts.map(async (receipt) => ({
      ...receipt,
      image: { ...receipt.image, blob: undefined, dataUrl: await blobToDataUrl(receipt.image.blob) } as unknown as PortableReceipt['image'],
    })),
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 250_000;
  const key = await keyFromPassword(password, salt, iterations);
  const plaintext = new TextEncoder().encode(JSON.stringify({ exportedAt: new Date().toISOString(), receipts: portable }));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const payload: EncryptedBackup = {
    format: 'billable-split-encrypted',
    version: 1,
    algorithm: 'AES-GCM',
    iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
  download(new Blob([JSON.stringify(payload)], { type: 'application/json' }), `billable-split-backup-${new Date().toISOString().slice(0, 10)}.billsplit`);
}

export async function readEncryptedBackup(file: File, password: string): Promise<Receipt[]> {
  let payload: EncryptedBackup;
  try {
    payload = JSON.parse(await file.text()) as EncryptedBackup;
  } catch {
    throw new Error('That file is not a Billable Split backup.');
  }
  if (payload.format !== 'billable-split-encrypted' || payload.version !== 1 || payload.algorithm !== 'AES-GCM') {
    throw new Error('That backup format is not supported by this version.');
  }
  if (!Number.isInteger(payload.iterations) || payload.iterations < 100_000 || payload.iterations > 1_000_000) {
    throw new Error('That backup has invalid encryption settings and was not restored.');
  }
  let plaintext: ArrayBuffer;
  try {
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const ciphertext = base64ToBytes(payload.ciphertext);
    if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 17) throw new Error('invalid encrypted payload');
    const key = await keyFromPassword(password, salt, payload.iterations);
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    );
  } catch {
    throw new Error('The backup could not be decrypted. Check the password and try again.');
  }
  let decoded: { receipts: PortableReceipt[] };
  try {
    decoded = JSON.parse(new TextDecoder().decode(plaintext)) as { receipts: PortableReceipt[] };
  } catch {
    throw new Error('The decrypted backup contents are damaged and were not restored.');
  }
  if (!Array.isArray(decoded.receipts)) throw new Error('The backup is missing its receipt records and was not restored.');
  return await Promise.all(decoded.receipts.map(async (receipt) => {
    if (!receipt?.image || typeof receipt.image.dataUrl !== 'string' || typeof receipt.image.sha256 !== 'string') {
      throw new Error('A receipt source image is missing from the backup. Nothing was restored.');
    }
    const [header, encoded] = receipt.image.dataUrl.split(',', 2);
    const mime = header?.match(/^data:(.*?);base64$/)?.[1] ?? '';
    if (!encoded || !mime) throw new Error('A receipt source image is damaged in the backup. Nothing was restored.');
    const bytes = base64ToBytes(encoded);
    const blob = new Blob([bytes], { type: mime });
    if (await sha256(blob) !== receipt.image.sha256) {
      throw new Error('A source image fingerprint does not match this backup. Nothing was restored.');
    }
    try {
      await validateReceiptImage(blob);
    } catch {
      throw new Error('A receipt source image is not valid in this backup. Nothing was restored.');
    }
      return {
        ...receipt,
        image: {
          filename: receipt.image.filename,
          mime,
          sha256: receipt.image.sha256,
          blob,
        },
      };
  }));
}
