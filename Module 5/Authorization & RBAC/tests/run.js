import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { posts } from '../src/data.js';

const SECRET = process.env.ACCESS_SECRET || 'test-secret';

function signToken(id, role) {
  return jwt.sign({ sub: id, role }, SECRET, { expiresIn: '15m' });
}

async function makeRequest(method, path, token, body = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  // Simple fetch wrapper using Express app listener for local testing
  const server = app.listen(0);
  const port = server.address().port;
  
  try {
    const res = await fetch(`http://localhost:${port}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    return { status: res.status, body: data };
  } finally {
    server.close();
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  const memberAToken = signToken('u-1', 'member');
  const memberBToken = signToken('u-2', 'member');
  const modToken = signToken('u-3', 'moderator');
  const adminToken = signToken('u-4', 'admin');

  const tests = [
    // Test 1: Owner edits own post -> 200
    async () => {
      const res = await makeRequest('PATCH', '/posts/p-1', memberAToken, { title: 'Updated Title' });
      return res.status === 200 && res.body.post.title === 'Updated Title';
    },
    // Test 2: Member B edits Member A post -> 403 (IDOR fix)
    async () => {
      const res = await makeRequest('PATCH', '/posts/p-1', memberBToken, { title: 'Hack' });
      return res.status === 403 && res.body.error?.code === 'FORBIDDEN';
    },
    // Test 3: Moderator deletes any post -> 200
    async () => {
      const res = await makeRequest('DELETE', '/posts/p-2', modToken);
      return res.status === 200;
    },
    // Test 4: Member tries to hide post -> 403
    async () => {
      const res = await makeRequest('POST', '/posts/p-1/hide', memberAToken);
      return res.status === 403 && res.body.error?.code === 'FORBIDDEN';
    },
    // Test 5: Moderator hides post -> 200
    async () => {
      const res = await makeRequest('POST', '/posts/p-1/hide', modToken);
      return res.status === 200;
    },
    // Test 6: Member calls admin route -> 403
    async () => {
      const res = await makeRequest('DELETE', '/users/u-1', memberAToken);
      return res.status === 403 && res.body.error?.code === 'FORBIDDEN';
    },
    // Test 7: Admin calls admin route -> 200
    async () => {
      const res = await makeRequest('DELETE', '/users/u-1', adminToken);
      return res.status === 200;
    },
    // Test 8: Non-existent post -> 404
    async () => {
      const res = await makeRequest('PATCH', '/posts/p-999', memberAToken, { title: 'Test' });
      return res.status === 404 && res.body.error?.code === 'NOT_FOUND';
    },
    // Test 9: Protected route without token -> 401
    async () => {
      const res = await makeRequest('DELETE', '/users/u-1', null);
      return res.status === 401 && res.body.error?.code === 'UNAUTHENTICATED';
    },
  ];

  for (let i = 0; i < tests.length; i++) {
    try {
      const ok = await tests[i]();
      if (ok) {
        passed++;
      } else {
        failed++;
        console.error(`Test ${i + 1} failed.`);
      }
    } catch (err) {
      failed++;
      console.error(`Test ${i + 1} threw error:`, err.message);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

runTests();