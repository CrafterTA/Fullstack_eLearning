const request = require('supertest');
const app = require('../server'); // vì bạn không tách app.js nên import từ server.js

describe('Full API Integration Test', () => {
  it('GET /api/users → 200', async () => {
    const res = await request(app).get('/api/users');
    expect([200, 401]).toContain(res.statusCode);
  });

it('GET /api/categories → 200 or 401', async () => {
  const res = await request(app).get('/api/categories');
  expect([200, 401]).toContain(res.statusCode);
});

it('GET /api/courses/:id → 200 or 404', async () => {
  const res = await request(app).get('/api/courses/1');
  expect([200, 404]).toContain(res.statusCode);
});

  it('GET /api/cart → 200 or 401', async () => {
    const res = await request(app).get('/api/cart');
    expect([200, 401]).toContain(res.statusCode);
  });

  it('GET /api/enrollments → 200 or 401', async () => {
    const res = await request(app).get('/api/enrollments');
    expect([200, 401]).toContain(res.statusCode);
  });

 it('GET /api/courses/1/reviews → 200 or 401', async () => {
  const res = await request(app).get('/api/courses/1/reviews');
  console.log(res.statusCode, res.body);
  expect([200, 401]).toContain(res.statusCode);
});

it('GET /api/courses/1/lessons → 200 or 401', async () => {
  const res = await request(app).get('/api/courses/1/lessons');
  expect([200, 401]).toContain(res.statusCode);
});


  it('GET /api/payments → 200 or 401', async () => {
    const res = await request(app).get('/api/payments');
    expect([200, 401]).toContain(res.statusCode);
  });
});
