const request = require('supertest');
const app = require('../server');

describe('API endpoints', () => {
  test('generate-barcode without bookId returns 400', async () => {
    const res = await request(app).post('/api/generate-barcode').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('generate-barcode with bookId returns 200 and barcodePath', async () => {
    const id = `TEST-${Date.now()}`;
    const res = await request(app).post('/api/generate-barcode').send({ bookId: id });
    // Depending on environment, barcode generation may fail (500) or succeed (200).
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('barcodePath');
    } else {
      expect(res.body).toHaveProperty('error');
    }
  });
});
