const SLUG = 'billable-receipt-split';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;

interface Verdict {
  valid: boolean;
  checkedAt: number;
  reason?: string;
}

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function licenseToken(): string | null {
  return localStorage.getItem(LICENSE_KEY);
}

export function isOptimisticallyUnlocked(): boolean {
  const token = licenseToken();
  if (!token) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
    return verdict.valid;
  } catch {
    return true;
  }
}

export function storeLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export async function verifyLicense(force = false): Promise<Verdict | null> {
  const token = licenseToken();
  if (!token || !navigator.onLine) return null;
  let cached: Verdict | null = null;
  try {
    cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
  } catch { /* no cached verdict */ }
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('verify unavailable');
    const result = (await response.json()) as { valid: boolean; reason?: string };
    const verdict = { valid: result.valid, reason: result.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    return cached;
  }
}
