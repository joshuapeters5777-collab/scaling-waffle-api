import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  ({ default: app } = await import('../index.js'));
});

describe('Product API integration', () => {
  test('GET / returns the API health message', async () => {
    const response = await request(app).get('/').expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'success',
        message: 'Charming Leather API is running successfully'
      })
    );
  });

  test('POST /api/products creates a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Leather Journal', price: 799, stock: 12 })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Leather Journal',
        price: 799,
        stock: 12
      })
    );
    expect(response.body.id).toBeDefined();
  });
});
