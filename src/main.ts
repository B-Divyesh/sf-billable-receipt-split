import './styles.css';
import { createEncryptedBackup, readEncryptedBackup } from './backup';
import { clearReceipts, deleteReceipt, getReceipt, listReceipts, replaceAllReceipts, saveReceipt, useStorageNamespace } from './db';
import { discardDemoState, seedDemo } from './demo';
import { CHECKOUT_URL, captureReturnedLicense, clearLicense, isOptimisticallyUnlocked, storeLicense, verifyLicense } from './license';
import { exportJobPdf } from './pdf';
import type { CostType, Receipt } from './types';
import { COST_LABELS } from './types';
import { MAX_AMOUNT, cents, csvForJob, download, escapeHtml, isReceiptExportable, jobsFor, money, receiptStatus, safeFilename, sha256, uid, validateReceiptImage } from './utils';

const app = document.querySelector<HTMLDivElement>('#app')!;
const FREE_RECEIPT_LIMIT = 5;
let receipts: Receipt[] = [];
let activeReceipt: Receipt | null = null;
let view: 'home' | 'receipt' | 'settings' | 'not-found' = 'home';
let objectUrl: string | null = null;
let unlocked = false;
let busy = false;
let demoMode = false;
let demoLimited = false;
let hasRendered = false;

function icon(name: 'mark' | 'plus' | 'back' | 'download' | 'shield' | 'trash' | 'more'): string {
  const paths = {
    mark: '<path d="M3 3h6v6H3zM11 3h6v6h-6zM19 3h6v6h-6zM7 11h6v6H7zM15 11h6v6h-6zM11 19h6v6h-6z"/>',
    plus: '<path d="M12 4h4v8h8v4h-8v8h-4v-8H4v-4h8z"/>',
    back: '<path d="M14 4 2 14l12 10v-6h10v-8H14V4z"/>',
    download: '<path d="M12 2h6v10h5L15 21 7 12h5V2zM4 23h22v4H4z"/>',
    shield: '<path d="M15 2 4 6v7c0 7 4.7 12 11 15 6.3-3 11-8 11-15V6L15 2zm-1 18-5-5 3-3 2 2 5-5 3 3-8 8z"/>',
    trash: '<path d="M8 8h14l-1 19H9L8 8zm3-5h8l1 3H10l1-3zM5 6h20v3H5z"/>',
    more: '<path d="M4 12h5v5H4zM13 12h5v5h-5zM22 12h5v5h-5z"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 30 30">${paths[name]}</svg>`;
}

function routeForCurrentView(): string {
  if (view === 'settings') return demoMode ? `/demo/settings${demoLimited ? '?free=1' : ''}` : '/settings';
  if (view === 'receipt' && activeReceipt) return `${demoMode ? '/demo/receipts' : '/receipts'}/${encodeURIComponent(activeReceipt.id)}`;
  return demoMode ? `/demo${demoLimited ? '?free=1' : ''}` : '/';
}

function productTitle(label: string): string {
  const suffix = ' — Billable Split';
  return `${label.slice(0, 60 - suffix.length).trimEnd()}${suffix}`;
}

async function navigate(path: string, replace = false): Promise<void> {
  const url = new URL(path, location.origin);
  const next = `${url.pathname}${url.search}`;
  const current = `${location.pathname}${location.search}`;
  if (replace && current !== next) history.replaceState({}, '', next);
  else if (!replace && current !== next) history.pushState({}, '', next);
  await loadRoute();
}

function applyMetadata(): void {
  const pathname = location.pathname;
  const params = new URLSearchParams(location.search);
  const isDemoLanding = pathname === '/demo' || pathname === '/demo/list' || (pathname === '/' && params.get('demo') === '1');
  const canonicalPath = pathname === '/' && params.get('demo') === '1' ? '/demo' : pathname;
  // A demo starts on a receipt detail, but the browser history and shared
  // preview must still describe the demo, not its seeded supplier.
  const page = isDemoLanding ? ['Demo — Billable Split', 'Try a completed supplier receipt split with sample data.']
    : demoMode && view === 'settings' ? ['Demo settings — Billable Split', 'Review sample backup and license controls without using real data.']
    : view === 'settings' ? ['Data and license — Billable Split', 'Back up receipt data or restore a purchase license.']
    : view === 'receipt' && activeReceipt ? [productTitle(activeReceipt.supplier), 'Split this supplier receipt between jobs and export job costs.']
    : view === 'not-found' ? ['Page not found — Billable Split', 'The page you requested is not available.']
    : ['Billable Split — split receipt costs by job', 'Split one supplier receipt across jobs and export job cost records.'];
  document.title = page[0];
  document.querySelector('meta[name="description"]')?.setAttribute('content', page[1]);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://billable-receipt-split.sociobot.in${canonicalPath}`);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', page[0]);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', page[1]);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', `https://billable-receipt-split.sociobot.in${canonicalPath}`);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', page[0]);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', page[1]);
}

function shell(content: string): string {
  const offline = navigator.onLine ? '' : '<div class="offline-bar" role="status">Offline mode · everything here still works</div>';
  return `
    ${offline}
    <header class="app-header">
      <a class="wordmark" href="/" data-route aria-label="Billable Split home">
        <span class="pixel-mark">${icon('mark')}</span><span>Billable<br><b>Split</b></span>
      </a>
      <nav aria-label="Primary navigation">
        <a class="nav-button ${view === 'home' && !demoMode ? 'is-current' : ''}" href="/" data-route>Receipts</a>
        <a class="nav-button ${demoMode ? 'is-current' : ''}" href="/demo" data-route>Demo</a>
        <a class="nav-button ${view === 'settings' ? 'is-current' : ''}" href="${demoMode ? `/demo/settings${demoLimited ? '?free=1' : ''}` : '/settings'}" data-route>Data & license</a>
        <a class="nav-button" href="/privacy/">Privacy</a>
      </nav>
    </header>
    ${demoMode ? '<aside class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><span><button class="text-button" data-reset-demo>Reset demo</button><button class="text-button" data-start-real>Start for real</button></span></aside>' : ''}
    <main id="main" tabindex="-1">${content}</main>
    <footer>
      <span>Receipt data stays in this browser. Purchase and license checks contact Sociobot only when you choose them.</span>
      <span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="https://sociobot.in" rel="external">Built by Param Factory</a> · v1.3.1</span>
    </footer>
    <div id="route-announcement" class="sr-only" aria-live="polite"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>
    ${newReceiptDialog()}
  `;
}

function newReceiptDialog(): string {
  return `<dialog id="new-receipt-dialog" aria-labelledby="new-receipt-title">
    <form method="dialog" class="dialog-close"><button value="cancel" aria-label="Close new receipt dialog">×</button></form>
    <div class="eyebrow">New receipt</div>
    <h2 id="new-receipt-title">Capture the receipt</h2>
    <p class="dialog-intro">Take a photo or choose an image. Billable Split adds a tamper-check value before you enter costs.</p>
    <form data-action="create-receipt" class="form-stack">
      <label class="upload-zone">
        <span class="upload-icon">▦</span>
        <strong>Choose receipt image</strong>
        <span>Camera or image file · kept on this device</span>
        <input name="image" type="file" accept="image/*" capture="environment" required />
      </label>
      <div class="field-grid">
        <label><span>Supplier</span><input name="supplier" autocomplete="organization" required maxlength="80" /></label>
        <label><span>Purchase date</span><input name="purchasedOn" type="date" value="${new Date().toISOString().slice(0, 10)}" required /></label>
        <label><span>Receipt total</span><input name="total" type="number" inputmode="decimal" min="0.01" max="${MAX_AMOUNT}" step="0.01" required /></label>
        <label><span>Currency</span><select name="currency"><option>USD</option><option>CAD</option><option>GBP</option><option>EUR</option><option>AUD</option><option>INR</option></select></label>
      </div>
      <label><span>Note <span class="optional">optional</span></span><input name="note" maxlength="160" placeholder="PO, card, or context" /></label>
      <p class="form-error" aria-live="assertive"></p>
      <button class="button button-primary button-wide" type="submit">Save receipt & continue ${icon('plus')}</button>
    </form>
  </dialog>`;
}

function stepRail(current: 1 | 2 | 3): string {
  return `<ol class="step-rail" aria-label="Receipt workflow">
    ${['Capture', 'Split', 'Export'].map((label, index) => {
      const step = index + 1;
      return `<li class="${step < current ? 'done' : step === current ? 'current' : ''}" ${step === current ? 'aria-current="step"' : ''}><span>${step < current ? '✓' : String(step).padStart(2, '0')}</span>${label}</li>`;
    }).join('')}
  </ol>`;
}

function dashboard(): string {
  const cards = receipts.map((receipt) => {
    const status = receiptStatus(receipt);
    const jobs = jobsFor(receipt);
    return `<li>
      <button class="receipt-card" data-open-receipt="${receipt.id}">
        <span class="receipt-date"><b>${new Date(`${receipt.purchasedOn}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}</b><small>${receipt.purchasedOn.slice(0, 4)}</small></span>
        <span class="receipt-main"><strong>${escapeHtml(receipt.supplier)}</strong><small>${receipt.lines.length} line${receipt.lines.length === 1 ? '' : 's'} · ${jobs.length} job${jobs.length === 1 ? '' : 's'}</small></span>
        <span class="receipt-money"><strong>${money(receipt.totalCents, receipt.currency)}</strong><small class="status ${status.className}"><i></i>${status.label}</small></span>
        <span class="card-arrow" aria-hidden="true">→</span>
      </button>
    </li>`;
  }).join('');
  return `<section class="dashboard">
    <div class="hero-copy">
      <div class="eyebrow"><span class="signal"></span> Receipt costs for several jobs</div>
      <h1>Split one supplier receipt by job</h1>
      <p>For contractors who buy materials for several jobs and need billable cost records.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="/demo" data-route>Try it with sample data ${icon('plus')}</a>
        <span>See a completed split and exports.</span>
      </div>
      <ul class="hero-facts"><li>Receipt data stays in this browser.</li><li>Works offline after the first visit.</li><li>Five receipts are free; $19 removes the limit.</li></ul>
    </div>
    <figure class="hero-art">
      <img src="/assets/receipt-split-hero-768-64af65b0.webp" srcset="/assets/receipt-split-hero-480-289a1d9c.webp 480w, /assets/receipt-split-hero-768-64af65b0.webp 768w" sizes="(max-width: 900px) calc(100vw - 40px), 50vw" width="768" height="512" alt="Pixel-art receipt dividing into three colored job folders on a workshop bench" fetchpriority="high" />
      <figcaption><span>Source receipt</span><i></i><span>Split by job</span><i></i><span>Export records</span></figcaption>
    </figure>
  </section>
  <section class="receipt-index" aria-labelledby="receipts-title">
    <div class="section-heading"><div><div class="eyebrow">Saved receipts: ${receipts.length}</div><h2 id="receipts-title">Recent receipts</h2></div>${receipts.length ? '<button class="button button-quiet" data-new-receipt>Add receipt</button>' : ''}</div>
    ${receipts.length ? `<ul class="receipt-list">${cards}</ul>` : `<div class="empty-state"><span class="empty-pixel">＋</span><div><h3>No receipts saved yet</h3><p>Add a supplier receipt to split its lines between jobs.</p></div><button class="button button-primary" data-new-receipt>Add a receipt</button></div>`}
  </section>
  <section class="landing-guide" aria-labelledby="how-it-works-title">
    <div class="landing-section-intro"><div class="eyebrow">Three steps</div><h2 id="how-it-works-title">How it works</h2></div>
    <ol class="workflow-list">
      <li><span class="workflow-number">01</span><div><h3>Capture the source receipt</h3><p>Keep the supplier photo with every split.</p></div></li>
      <li><span class="workflow-number">02</span><div><h3>Split each item by job</h3><p>Enter each item, then divide its amount between jobs.</p></div></li>
      <li><span class="workflow-number">03</span><div><h3>Export records by job</h3><p>Download a CSV or PDF for each job.</p></div></li>
    </ol>
  </section>
  <section class="landing-boundary" aria-labelledby="scope-title">
    <div><div class="eyebrow">Manual record keeping</div><h2 id="scope-title">What Billable Split does not do</h2><p>Enter receipt lines yourself. It does not read receipt text automatically.</p><p>Review each amount before using an export for bookkeeping or tax work.</p></div>
    <div class="boundary-facts"><p>Receipt data stays in this browser.</p><p>Purchase and license checks contact Sociobot only when you choose them.</p><a href="/privacy/">Read the privacy details</a></div>
  </section>
  <section class="landing-price" aria-labelledby="price-title">
    <div><div class="eyebrow">One-time license</div><h2 id="price-title">Free and paid use</h2><p>Five receipts are free. A $19 one-time license removes only the receipt limit.</p></div>
    <a class="button button-primary" href="/settings" data-route>View data and license options</a>
  </section>`;
}

function allocationRow(receipt: Receipt, lineId: string, allocation: Receipt['lines'][number]['allocations'][number]): string {
  return `<form class="allocation-row" data-action="edit-allocation" data-line-id="${lineId}" data-allocation-id="${allocation.id}">
    <label><span>Job</span><input name="job" value="${escapeHtml(allocation.job)}" required maxlength="80" /></label>
    <label><span>Amount</span><input name="amount" type="number" inputmode="decimal" min="0.01" max="${MAX_AMOUNT}" step="0.01" value="${(allocation.amountCents / 100).toFixed(2)}" required /></label>
    <label><span>Status</span><select name="type">${Object.entries(COST_LABELS).map(([value, label]) => `<option value="${value}" ${allocation.type === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    <button class="button button-small" type="submit">Save</button>
    <button class="icon-button danger" type="button" data-delete-allocation="${allocation.id}" data-line-id="${lineId}" aria-label="Delete ${escapeHtml(allocation.job)} job split">${icon('trash')}</button>
  </form>`;
}

function receiptDetail(receipt: Receipt): string {
  const status = receiptStatus(receipt);
  const exportable = isReceiptExportable(receipt);
  const lineTotal = receipt.lines.reduce((sum, line) => sum + line.amountCents, 0);
  const allJobs = jobsFor(receipt);
  const lines = receipt.lines.map((line, index) => {
    const allocated = line.allocations.reduce((sum, allocation) => sum + allocation.amountCents, 0);
    const remaining = line.amountCents - allocated;
    return `<li class="line-card">
      <div class="line-summary">
        <span class="line-number">${String(index + 1).padStart(2, '0')}</span>
        <div><strong>${escapeHtml(line.description)}</strong><small>${line.allocations.length ? `${line.allocations.length} job split${line.allocations.length === 1 ? '' : 's'}` : 'Not split yet'}</small></div>
        <span class="line-amount">${money(line.amountCents, receipt.currency)}<small class="${remaining === 0 ? 'text-success' : remaining < 0 ? 'text-danger' : 'text-warning'}">${remaining === 0 ? 'Balanced' : `${money(Math.abs(remaining), receipt.currency)} ${remaining < 0 ? 'over' : 'left'}`}</small></span>
        <button class="button button-small" type="button" data-toggle-line="${line.id}" aria-expanded="true">Edit split</button>
      </div>
      <div class="line-editor" id="line-${line.id}">
        <form class="edit-line" data-action="edit-line" data-line-id="${line.id}">
          <label><span>Description</span><input name="description" value="${escapeHtml(line.description)}" required maxlength="100" /></label>
          <label><span>Line total</span><input name="amount" type="number" inputmode="decimal" min="0.01" max="${MAX_AMOUNT}" step="0.01" value="${(line.amountCents / 100).toFixed(2)}" required /></label>
          <button class="button button-small" type="submit">Save line</button>
          <button class="text-button danger-text" type="button" data-delete-line="${line.id}">Delete line</button>
        </form>
        <p class="form-error line-error" aria-live="assertive"></p>
        ${line.allocations.map((allocation) => allocationRow(receipt, line.id, allocation)).join('')}
        <form class="new-allocation" data-action="add-allocation" data-line-id="${line.id}">
          <label><span>Job</span><input name="job" list="jobs-${receipt.id}" required maxlength="80" placeholder="e.g. Oak Street kitchen" /></label>
          <label><span>Amount</span><input name="amount" type="number" inputmode="decimal" min="0.01" max="${MAX_AMOUNT}" step="0.01" value="${remaining > 0 ? (remaining / 100).toFixed(2) : ''}" required /></label>
          <label><span>Status</span><select name="type"><option value="billable">Billable</option><option value="reimbursable">Reimbursable</option><option value="non-billable">Non-billable</option></select></label>
          <button class="button button-secondary" type="submit">Add split</button>
        </form>
      </div>
    </li>`;
  }).join('');
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(receipt.image.blob);
  return `<section class="receipt-workspace">
    <div class="workspace-top">
      <a class="back-button" href="${demoMode ? `/demo/list${demoLimited ? '?free=1' : ''}` : '/'}" data-route>${icon('back')} All receipts</a>
      ${stepRail(allJobs.length ? 3 : receipt.lines.length ? 2 : 1)}
      <span class="status ${status.className}"><i></i>${status.label}</span>
    </div>
    <div class="receipt-heading">
      <div><div class="eyebrow">${escapeHtml(receipt.purchasedOn)} / ${escapeHtml(receipt.currency)}</div><h1>${escapeHtml(receipt.supplier)}</h1><p>${escapeHtml(receipt.note || 'Supplier receipt split')}</p></div>
      <div class="receipt-total"><small>Source total</small><strong>${money(receipt.totalCents, receipt.currency)}</strong></div>
    </div>
    <div class="workspace-grid">
      <aside class="source-panel" aria-labelledby="source-title">
        <div class="panel-title"><div><div class="eyebrow">Original receipt</div><h2 id="source-title">Receipt image</h2></div><span title="Source image has a tamper-check value">${icon('shield')}</span></div>
        <img src="${objectUrl}" alt="Source receipt from ${escapeHtml(receipt.supplier)}" />
        <dl class="source-meta"><div><dt>Original file</dt><dd>${escapeHtml(receipt.image.filename)}</dd></div><div><dt>Tamper-check value</dt><dd title="${receipt.image.sha256}">${receipt.image.sha256}</dd></div></dl>
      </aside>
      <section class="ledger-panel" aria-labelledby="ledger-title">
        <div class="panel-title ledger-title"><div><div class="eyebrow">Job split ledger</div><h2 id="ledger-title">Receipt lines</h2></div><span class="ledger-tally">${money(lineTotal, receipt.currency)} / ${money(receipt.totalCents, receipt.currency)}</span></div>
        <datalist id="jobs-${receipt.id}">${allJobs.map((job) => `<option value="${escapeHtml(job)}"></option>`).join('')}</datalist>
        ${receipt.lines.length ? `<ol class="line-list">${lines}</ol>` : '<div class="ledger-empty"><span>01</span><h3>Add the first receipt line</h3><p>Enter each purchased item exactly once, then split it across one or more jobs.</p></div>'}
        <form class="add-line-form" data-action="add-line">
          <label><span>Line description</span><input name="description" required maxlength="100" placeholder="e.g. 12mm plywood sheets" /></label>
          <label><span>Line total</span><input name="amount" type="number" inputmode="decimal" min="0.01" max="${MAX_AMOUNT}" step="0.01" required placeholder="0.00" /></label>
          <button class="button button-primary" type="submit">Add line ${icon('plus')}</button>
        </form>
        <p class="form-error" aria-live="assertive"></p>
      </section>
    </div>
    <section class="export-panel" aria-labelledby="export-title">
      <div><div class="eyebrow">Job cost records</div><h2 id="export-title">Export by job</h2><p>${exportable ? 'Every PDF includes the receipt image and its tamper-check value.' : 'Balance every line and the receipt total before exporting.'}</p></div>
      ${allJobs.length ? `<ul class="job-list">${allJobs.map((job) => {
        const total = receipt.lines.flatMap((line) => line.allocations).filter((allocation) => allocation.job === job).reduce((sum, allocation) => sum + allocation.amountCents, 0);
        return `<li><span><strong>${escapeHtml(job)}</strong><small>${money(total, receipt.currency)} split</small></span><button class="button button-secondary" data-export-csv="${escapeHtml(job)}" ${exportable ? '' : 'disabled'}>CSV ${icon('download')}</button><button class="button button-primary" data-export-pdf="${escapeHtml(job)}" ${exportable ? '' : 'disabled'}>PDF ${icon('download')}</button></li>`;
      }).join('')}</ul>` : '<div class="export-empty">Add a job split to make its CSV and PDF.</div>'}
    </section>
    <details class="history-panel"><summary>Receipt history <span>${receipt.history.length} events</span></summary><ol>${receipt.history.slice(0, 12).map((event) => `<li><time>${new Date(event.at).toLocaleString()}</time>${escapeHtml(event.label)}</li>`).join('')}</ol></details>
    <div class="danger-zone"><div><strong>Delete this receipt</strong><span>Removes the image, splits, and history from this device.</span></div><button class="button button-danger" data-delete-receipt>Delete permanently</button></div>
  </section>`;
}

function settings(): string {
  const licenseSection = demoMode && !demoLimited
    ? `<section class="license-panel" aria-labelledby="license-title"><div><div class="eyebrow">Sample license</div><h2 id="license-title">Sample archive has no receipt limit</h2><p>This sample shows the workspace after a valid $19 license removes the five-receipt limit. It does not use or save a license.</p></div><small>Start for real before buying or restoring a license. <a href="/terms/">Terms</a> apply.</small></section>`
    : demoMode
      ? `<section class="license-panel" aria-labelledby="license-title"><div><div class="eyebrow">Sample free archive</div><h2 id="license-title">The five-receipt sample archive is full</h2><p>Start for real to buy or restore a license. This limited sample never uses or saves a real license.</p></div><small>CSV, PDF, backup, and deletion stay available. <a href="/terms/">Terms</a> apply.</small></section>`
    : `<section class="license-panel" aria-labelledby="license-title">
      <div><div class="eyebrow">One-time license</div><h2 id="license-title">${unlocked ? 'Unlimited archive unlocked' : 'Keep every receipt'}</h2><p>${unlocked ? 'This device can create an unlimited receipt archive. CSV, PDF, backup, and deletion always remain available.' : `The free version includes ${FREE_RECEIPT_LIMIT} complete receipts with all exports. Pay $19 once to remove the archive limit on your devices.`}</p>${!unlocked && receipts.length >= FREE_RECEIPT_LIMIT ? '<p class="form-error">The free archive is full. Export or delete a receipt, or unlock unlimited storage.</p>' : ''}</div>
      ${unlocked ? '<button class="button button-quiet" data-remove-license>Remove license from this device</button>' : `<div class="license-actions"><a class="button button-primary" href="${CHECKOUT_URL}">Buy once · $19</a><form data-action="restore-license"><label><span>Have a license?</span><input name="license" autocomplete="off" required placeholder="Paste license token" /></label><button class="button button-secondary" type="submit">Verify & unlock</button><p class="form-error" aria-live="assertive"></p></form></div>`}
      <small>Sociobot / Dodo is the merchant of record. Refunds are handled there and revoke the license. <a href="/terms/">Terms</a> apply.</small>
    </section>`;
  return `<section class="settings-page">
    <div class="eyebrow">Device control panel</div><h1>Back up or restore receipt data</h1><p class="lede">Back up every receipt and image in one password-encrypted file. Nothing is uploaded.</p>
    <div class="settings-grid">
      <section aria-labelledby="backup-title"><span class="setting-icon">${icon('shield')}</span><h2 id="backup-title">Encrypted backup</h2><p>The downloaded file protects receipt images and job splits with your password. Keep it somewhere safe—we cannot recover it.</p>
        <form data-action="backup" class="form-stack"><label><span>Backup password</span><input name="password" type="password" minlength="10" autocomplete="new-password" required /></label><button class="button button-primary" type="submit">Download encrypted backup ${icon('download')}</button></form>
      </section>
      <section aria-labelledby="restore-title"><span class="setting-icon">↺</span><h2 id="restore-title">Restore backup</h2><p>Restoring replaces the receipts currently on this device. The backup is checked and decrypted before anything changes.</p>
        <form data-action="restore" class="form-stack"><label><span>Backup file</span><input name="backup" type="file" accept=".billsplit,application/json" required /></label><label><span>Backup password</span><input name="password" type="password" autocomplete="current-password" required /></label><button class="button button-secondary" type="submit">Check & restore backup</button><p class="form-error" aria-live="assertive"></p></form>
      </section>
    </div>
    ${licenseSection}
  </section>`;
}

function notFound(): string {
  return `<section class="fatal"><div class="eyebrow">404</div><h1>Page not found</h1><p>This address does not point to a Billable Split page.</p><a class="button button-primary" href="/" data-route>Go to receipts</a></section>`;
}

function render(): void {
  if (objectUrl && view !== 'receipt') { URL.revokeObjectURL(objectUrl); objectUrl = null; }
  const content = view === 'receipt' && activeReceipt ? receiptDetail(activeReceipt) : view === 'settings' ? settings() : view === 'not-found' ? notFound() : dashboard();
  app.innerHTML = shell(content);
  applyMetadata();
  const heading = document.querySelector<HTMLElement>('main h1');
  heading?.setAttribute('tabindex', '-1');
  if (hasRendered) requestAnimationFrame(() => heading?.focus());
  hasRendered = true;
  const announcement = document.querySelector<HTMLElement>('#route-announcement');
  if (announcement && heading) announcement.textContent = heading.textContent ?? '';
}

function toast(message: string, tone: 'normal' | 'error' = 'normal'): void {
  const element = document.querySelector<HTMLDivElement>('#toast');
  if (!element) return;
  element.textContent = message;
  element.className = `toast show ${tone === 'error' ? 'toast-error' : ''}`;
  setTimeout(() => element.classList.remove('show'), 3_400);
}

function errorFor(form: HTMLFormElement, message: string): void {
  const output = form.querySelector<HTMLElement>('.form-error') ?? form.parentElement?.querySelector<HTMLElement>('.form-error');
  if (output) output.textContent = message;
  else toast(message, 'error');
}

function touch(receipt: Receipt, label: string): void {
  receipt.updatedAt = new Date().toISOString();
  receipt.history.unshift({ id: uid(), at: receipt.updatedAt, label });
}

async function persist(label: string): Promise<void> {
  if (!activeReceipt) return;
  touch(activeReceipt, label);
  await saveReceipt(activeReceipt);
  receipts = await listReceipts();
  render();
  toast(label);
}

async function createReceipt(form: HTMLFormElement): Promise<void> {
  if (busy) return;
  if (!unlocked && receipts.length >= FREE_RECEIPT_LIMIT) {
    await navigate(demoMode ? `/demo/settings${demoLimited ? '?free=1' : ''}` : '/settings'); toast('The free archive is full. Export or delete a receipt, or unlock unlimited storage.', 'error'); return;
  }
  const data = new FormData(form);
  const file = data.get('image');
  if (!(file instanceof File) || file.size === 0) { errorFor(form, 'Choose a receipt image to continue.'); return; }
  if (file.size > 20 * 1024 * 1024) { errorFor(form, 'That image is over 20 MB. Choose a smaller photo.'); return; }
  busy = true;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const buttonContent = button?.innerHTML;
  if (button) { button.disabled = true; button.textContent = 'Checking receipt…'; }
  try {
    const mime = await validateReceiptImage(file);
    const now = new Date().toISOString();
    const receipt: Receipt = {
      id: uid(), supplier: String(data.get('supplier')).trim(), purchasedOn: String(data.get('purchasedOn')),
      currency: String(data.get('currency')), totalCents: cents(data.get('total')), note: String(data.get('note') ?? '').trim(),
      image: { blob: file, filename: file.name, mime, sha256: await sha256(file) }, lines: [],
      history: [{ id: uid(), at: now, label: 'Receipt saved with tamper-check value' }], createdAt: now, updatedAt: now,
    };
    await saveReceipt(receipt); receipts = await listReceipts(); activeReceipt = receipt; view = 'receipt'; navigate(routeForCurrentView()); toast('Receipt saved. Add its lines.');
  } catch (error) { errorFor(form, error instanceof Error ? error.message : 'The receipt could not be saved.'); }
  finally {
    busy = false;
    if (button && button.isConnected && buttonContent) { button.disabled = false; button.innerHTML = buttonContent; }
  }
}

app.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement;
  if (target.closest('[data-reload]')) { location.reload(); return; }
  const routeLink = target.closest<HTMLAnchorElement>('[data-route]');
  if (routeLink) { event.preventDefault(); await navigate(routeLink.getAttribute('href') ?? '/'); return; }
  const nav = target.closest<HTMLElement>('[data-nav]');
  if (nav) { await navigate(nav.dataset.nav === 'settings' ? (demoMode ? `/demo/settings${demoLimited ? '?free=1' : ''}` : '/settings') : '/'); return; }
  if (target.closest('[data-reset-demo]')) { await seedDemo(true); await navigate(`/demo${demoLimited ? '?free=1' : ''}`, true); toast('Sample data reset'); return; }
  if (target.closest('[data-start-real]')) { await clearReceipts(); discardDemoState(); await navigate('/', true); toast('Demo data discarded. You can now add a real receipt.'); return; }
  if (target.closest('[data-new-receipt]')) {
    if (!unlocked && receipts.length >= FREE_RECEIPT_LIMIT) { await navigate(demoMode ? `/demo/settings${demoLimited ? '?free=1' : ''}` : '/settings'); toast('The free archive is full. Unlock unlimited receipts or delete one.', 'error'); }
    else document.querySelector<HTMLDialogElement>('#new-receipt-dialog')?.showModal();
    return;
  }
  const open = target.closest<HTMLElement>('[data-open-receipt]');
  if (open?.dataset.openReceipt) { activeReceipt = await getReceipt(open.dataset.openReceipt) ?? null; if (activeReceipt) { view = 'receipt'; await navigate(routeForCurrentView()); } return; }
  const toggle = target.closest<HTMLButtonElement>('[data-toggle-line]');
  if (toggle) { const editor = document.querySelector<HTMLElement>(`#line-${toggle.dataset.toggleLine}`); if (editor) { editor.hidden = !editor.hidden; toggle.setAttribute('aria-expanded', String(!editor.hidden)); toggle.textContent = editor.hidden ? 'Edit split' : 'Hide split'; } return; }
  const deleteLineButton = target.closest<HTMLElement>('[data-delete-line]');
  if (deleteLineButton?.dataset.deleteLine && activeReceipt && confirm('Delete this line and all of its job splits?')) {
    activeReceipt.lines = activeReceipt.lines.filter((line) => line.id !== deleteLineButton.dataset.deleteLine); await persist('Receipt line deleted'); return;
  }
  const deleteAllocationButton = target.closest<HTMLElement>('[data-delete-allocation]');
  if (deleteAllocationButton?.dataset.deleteAllocation && activeReceipt) {
    const line = activeReceipt.lines.find((item) => item.id === deleteAllocationButton.dataset.lineId);
    if (line) { line.allocations = line.allocations.filter((item) => item.id !== deleteAllocationButton.dataset.deleteAllocation); await persist('Job split deleted'); } return;
  }
  if (target.closest('[data-delete-receipt]') && activeReceipt) {
    const supplier = activeReceipt.supplier;
    if (confirm(`Permanently delete the ${supplier} receipt, its image, and every job split? This cannot be undone.`)) {
      await deleteReceipt(activeReceipt.id); receipts = await listReceipts(); activeReceipt = null; view = 'home'; await navigate(demoMode ? '/demo/list' : '/'); toast(`${supplier} receipt permanently deleted`);
    } return;
  }
  const csvButton = target.closest<HTMLElement>('[data-export-csv]');
  if (csvButton?.dataset.exportCsv && activeReceipt) {
    if (!isReceiptExportable(activeReceipt)) { toast('Balance every line and the source total before exporting.', 'error'); return; }
    const job = csvButton.dataset.exportCsv; download(new Blob([csvForJob(activeReceipt, job)], { type: 'text/csv;charset=utf-8' }), `${safeFilename(job)}-${activeReceipt.purchasedOn}-costs.csv`); toast(`${job} CSV downloaded`); return;
  }
  const pdfButton = target.closest<HTMLButtonElement>('[data-export-pdf]');
  if (pdfButton?.dataset.exportPdf && activeReceipt) {
    if (!isReceiptExportable(activeReceipt)) { toast('Balance every line and the source total before exporting.', 'error'); return; }
    pdfButton.disabled = true; pdfButton.textContent = 'Building…';
    try { await exportJobPdf(activeReceipt, pdfButton.dataset.exportPdf); toast(`${pdfButton.dataset.exportPdf} PDF downloaded`); } catch { toast('The PDF could not be created. Try the CSV export instead.', 'error'); } finally { render(); }
    return;
  }
  if (target.closest('[data-remove-license]') && !demoMode) { clearLicense(); unlocked = false; render(); toast('License removed from this device'); }
});

app.addEventListener('submit', async (event) => {
  const form = event.target as HTMLFormElement;
  const action = form.dataset.action;
  if (!action) return;
  event.preventDefault();
  const data = new FormData(form);
  try {
    if (action === 'create-receipt') { await createReceipt(form); return; }
    if (action === 'add-line' && activeReceipt) {
      activeReceipt.lines.push({ id: uid(), description: String(data.get('description')).trim(), amountCents: cents(data.get('amount')), allocations: [] }); await persist('Receipt line added'); return;
    }
    if (action === 'edit-line' && activeReceipt) {
      const line = activeReceipt.lines.find((item) => item.id === form.dataset.lineId);
      if (line) {
        const nextAmount = cents(data.get('amount'));
        const allocated = line.allocations.reduce((sum, item) => sum + item.amountCents, 0);
        if (nextAmount < allocated) {
          errorFor(form, `Line total cannot be less than its ${money(allocated, activeReceipt.currency)} of job splits. Reconcile the splits first.`);
          return;
        }
        line.description = String(data.get('description')).trim(); line.amountCents = nextAmount; await persist('Receipt line updated');
      }
      return;
    }
    if (action === 'add-allocation' && activeReceipt) {
      const line = activeReceipt.lines.find((item) => item.id === form.dataset.lineId);
      if (line) { const amount = cents(data.get('amount')); const allocated = line.allocations.reduce((sum, item) => sum + item.amountCents, 0); if (allocated + amount > line.amountCents) { errorFor(form, `This is ${money(allocated + amount - line.amountCents, activeReceipt.currency)} over the line total.`); return; } line.allocations.push({ id: uid(), job: String(data.get('job')).trim(), amountCents: amount, type: String(data.get('type')) as CostType }); await persist('Job split added'); } return;
    }
    if (action === 'edit-allocation' && activeReceipt) {
      const line = activeReceipt.lines.find((item) => item.id === form.dataset.lineId); const allocation = line?.allocations.find((item) => item.id === form.dataset.allocationId);
      if (line && allocation) { const nextAmount = cents(data.get('amount')); const otherTotal = line.allocations.filter((item) => item.id !== allocation.id).reduce((sum, item) => sum + item.amountCents, 0); if (otherTotal + nextAmount > line.amountCents) { errorFor(form, `This is ${money(otherTotal + nextAmount - line.amountCents, activeReceipt.currency)} over the line total.`); return; } allocation.job = String(data.get('job')).trim(); allocation.amountCents = nextAmount; allocation.type = String(data.get('type')) as CostType; await persist('Job split updated'); } return;
    }
    if (action === 'backup') { const password = String(data.get('password')); await createEncryptedBackup(receipts, password); form.reset(); toast('Encrypted backup downloaded'); return; }
    if (action === 'restore') {
      const file = data.get('backup'); if (!(file instanceof File)) return;
      const restored = await readEncryptedBackup(file, String(data.get('password')));
      if (!confirm(`Replace this device's ${receipts.length} receipt(s) with the ${restored.length} receipt(s) in this backup?`)) return;
      await replaceAllReceipts(restored); receipts = await listReceipts(); view = 'home'; navigate(routeForCurrentView()); toast(`${restored.length} receipts restored`); return;
    }
    if (action === 'restore-license' && !demoMode) {
      storeLicense(String(data.get('license'))); const verdict = await verifyLicense(true);
      if (verdict?.valid) { unlocked = true; render(); toast('Unlimited archive unlocked'); }
      else { clearLicense(); unlocked = false; errorFor(form, 'That license could not be verified. Check the token and your connection.'); }
    }
  } catch (error) { errorFor(form, error instanceof Error ? error.message : 'That action could not be completed.'); }
});

window.addEventListener('online', () => { render(); toast('Back online'); if (!demoMode) void verifyLicense().then((verdict) => { if (verdict && verdict.valid !== unlocked) { unlocked = verdict.valid; render(); if (!verdict.valid) toast('License no longer active', 'error'); } }); });
window.addEventListener('offline', () => { render(); toast('Offline mode is ready'); });
window.addEventListener('popstate', () => { void loadRoute(); });

async function loadRoute(): Promise<void> {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const params = new URLSearchParams(location.search);
  const wantsDemo = path === '/demo' || path === '/demo/list' || path === '/demo/settings' || path.startsWith('/demo/receipts/') || params.get('demo') === '1';
  demoMode = wantsDemo;
  demoLimited = demoMode && params.get('free') === '1';
  useStorageNamespace(demoMode ? 'demo' : 'real');
  if (demoMode) await seedDemo();
  if (demoMode) unlocked = !demoLimited;
  else { captureReturnedLicense(); unlocked = isOptimisticallyUnlocked(); }
  receipts = await listReceipts();
  activeReceipt = null;
  if (path === '/' || path === '/demo' || path === '/demo/list') {
    if (demoMode && path !== '/demo/list') { activeReceipt = receipts[0] ?? null; view = activeReceipt ? 'receipt' : 'home'; }
    else view = 'home';
  } else if (path === '/settings' || path === '/demo/settings') view = 'settings';
  else if (path.startsWith('/receipts/') || path.startsWith('/demo/receipts/')) {
    const prefix = path.startsWith('/demo/receipts/') ? '/demo/receipts/' : '/receipts/';
    activeReceipt = await getReceipt(decodeURIComponent(path.slice(prefix.length))) ?? null; view = activeReceipt ? 'receipt' : 'not-found';
  }
  else view = 'not-found';
  render();
}

async function start(): Promise<void> {
  try { await loadRoute(); } catch (error) { app.innerHTML = shell(`<section class="fatal"><h1>Local storage is unavailable</h1><p>${escapeHtml(error instanceof Error ? error.message : 'Reload in a standard browser window.')}</p><button class="button button-primary" data-reload>Try again</button></section>`); return; }
  if (!demoMode) void verifyLicense().then((verdict) => { if (verdict && verdict.valid !== unlocked) { unlocked = verdict.valid; render(); if (!verdict.valid) toast('License no longer active', 'error'); } });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) toast('Update ready. Reload to use it.'); });
      });
    }).catch(() => { /* app remains usable without install support */ });
  }
}

void start();
