import assert from 'node:assert/strict';

const PRODUCT_SLUG = 'billable-receipt-split';
const API_ORIGIN = 'https://api.sociobot.in';
const PRODUCT_URL = 'https://billable-receipt-split.sociobot.in/';
const CHECKOUT_URL = `${API_ORIGIN}/api/v1/products/${PRODUCT_SLUG}/checkout`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15_000),
  });
  return response;
}

const catalogResponse = await request(`${API_ORIGIN}/api/v1/products`);
assert.equal(catalogResponse.status, 200, 'The production product catalog must be available');
const catalog = await catalogResponse.json();
const product = catalog.data?.find((entry) => entry.slug === PRODUCT_SLUG);
assert.ok(product, `${PRODUCT_SLUG} must be registered in the production catalog`);
assert.deepEqual(
  {
    checkout_url: product.checkout_url,
    currency: product.currency,
    name: product.name,
    price_minor: product.price_minor,
    product_url: product.product_url,
  },
  {
    checkout_url: CHECKOUT_URL,
    currency: 'USD',
    name: 'Billable Split',
    price_minor: 1900,
    product_url: PRODUCT_URL,
  },
  'The production billing registration must match the product contract',
);

const checkoutResponse = await request(CHECKOUT_URL, { redirect: 'manual' });
assert.equal(checkoutResponse.status, 303, 'Checkout must redirect to the hosted payment page');
const checkoutLocation = checkoutResponse.headers.get('location');
assert.ok(checkoutLocation, 'Checkout redirect must include a destination');
const checkoutDestination = new URL(checkoutLocation);
assert.equal(checkoutDestination.origin, 'https://checkout.dodopayments.com');
assert.match(checkoutDestination.pathname, /^\/session\/cks_[A-Za-z0-9]+$/);

const invalidLicense = `release-check-${Date.now()}`;
const verifyResponse = await request(
  `${API_ORIGIN}/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(invalidLicense)}`,
);
assert.equal(verifyResponse.status, 200, 'License verification must remain available');
assert.match(verifyResponse.headers.get('cache-control') ?? '', /no-store/);
assert.deepEqual(await verifyResponse.json(), {
  expires_at: null,
  reason: 'invalid',
  valid: false,
});

console.log('Production billing contract verified: catalog, $19 checkout redirect, and invalid-license policy.');
