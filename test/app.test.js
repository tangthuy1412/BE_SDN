const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.SECRET_KEY = 'test-secret-key-that-is-longer-than-32-characters';

const app = require('../src/app');

test('health endpoint reports service status', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'quiz-api');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('unknown endpoint uses the JSON error contract', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/missing`);
    const body = await response.json();
    assert.equal(response.status, 404);
    assert.match(body.message, /Route GET/);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
