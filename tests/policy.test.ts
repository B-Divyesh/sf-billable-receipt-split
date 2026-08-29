import { describe, expect, it } from 'vitest';
import config from '../public/staticwebapp.config.json';
import { readFileSync } from 'node:fs';

describe('production response and update policy', () => {
  it('ships security policies and immutable asset caching', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('geolocation=()');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find((route) => route.route === '/sw.js')?.headers['Cache-Control']).toContain('no-store');
  });

  it('deletes only superseded Billable Split caches on activation and subsequent requests', () => {
    const worker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
    expect(worker).toContain("key.startsWith(CACHE_PREFIX) && key !== VERSION");
    expect(worker).toContain('event.waitUntil(deleteOldCaches())');
  });

  it('keeps the offline fallback compatible with the production CSP', () => {
    const offline = readFileSync(new URL('../public/offline.html', import.meta.url), 'utf8');
    expect(offline).not.toContain('<style');
    expect(offline).toContain('href="/legal.css"');
    expect(offline).toContain('<main id="main">');
  });
});
