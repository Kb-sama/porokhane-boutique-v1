const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const body = await response.text();
  let parsedBody = body;
  try {
    parsedBody = JSON.parse(body);
  } catch {}
  return { response, body: parsedBody };
}

test('GET /api/public/products retourne une liste de produits', async () => {
  const { response, body } = await request('/api/public/products');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
});

test('GET /api/public/live retourne un état de live', async () => {
  const { response, body } = await request('/api/public/live');
  assert.equal(response.status, 200);
  assert.ok(body && typeof body === 'object');
});

test('GET /api/public/site-texts retourne un objet de textes', async () => {
  const { response, body } = await request('/api/public/site-texts');
  assert.equal(response.status, 200);
  assert.ok(body && typeof body === 'object');
});

test('GET /api/public/whatsapp retourne des liens WhatsApp', async () => {
  const { response, body } = await request('/api/public/whatsapp');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
});

test('POST /api/login rejette les identifiants invalides', async () => {
  const { response, body } = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nope@example.com', password: 'bad' }),
  });
  assert.equal(response.status, 401);
  assert.ok(body.error);
});

test('POST /api/admin/shop-status accepte le payload shopStatus', async () => {
  const loginResponse = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'mame79915@gmail.com',
      password: 'V7!qR2#nL9@xP4$kZ8&mT6',
    }),
  });

  const cookieHeader = loginResponse.headers.get('set-cookie');
  assert.ok(cookieHeader, 'La session admin doit être créée');

  const updateResponse = await fetch(`${baseUrl}/api/admin/shop-status`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: cookieHeader,
    },
    body: JSON.stringify({ shopStatus: 'maintenance' }),
  });

  const body = await updateResponse.json();
  assert.equal(updateResponse.status, 200);
  assert.equal(body.shopStatus, 'maintenance');
});
