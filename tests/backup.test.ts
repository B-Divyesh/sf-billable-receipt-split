import { describe, expect, it } from 'vitest';
import { readEncryptedBackup } from '../src/backup';

function asBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

async function encryptedBackup(password: string): Promise<File> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 250_000 }, material,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt'],
  );
  const portable = {
    receipts: [{
      id: 'r1', supplier: 'North Yard', purchasedOn: '2026-08-28', currency: 'USD', totalCents: 100,
      note: '', lines: [], history: [], createdAt: '2026-08-28T00:00:00Z', updatedAt: '2026-08-28T00:00:00Z',
      image: {
        filename: 'receipt.png', mime: 'image/png',
        sha256: '0'.repeat(64),
        dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
      },
    }],
  };
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(portable)));
  const payload = {
    format: 'billable-split-encrypted', version: 1, algorithm: 'AES-GCM', iterations: 250_000,
    salt: asBase64(salt), iv: asBase64(iv), ciphertext: asBase64(new Uint8Array(ciphertext)),
  };
  return new File([JSON.stringify(payload)], 'corrupt.billsplit', { type: 'application/json' });
}

describe('encrypted backup integrity errors', () => {
  it('reports a fingerprint mismatch separately from a wrong password', async () => {
    const backup = await encryptedBackup('correct-horse-battery');
    await expect(readEncryptedBackup(backup, 'correct-horse-battery')).rejects.toThrow('source image fingerprint does not match');
    await expect(readEncryptedBackup(backup, 'wrong-password')).rejects.toThrow('could not be decrypted');
  });
});
