import request from 'supertest';
import app from '../index.js'; // Pulls in your Express app without starting the port

describe('Infrastructure & Security Tests', () => {
  
  it('Should return a 404 for an unknown route', async () => {
    const response = await request(app).get('/api/ghost-route');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Route not found');
  });

  it('Should enforce rate limiting headers', async () => {
    const response = await request(app).get('/api/products');
    // Express-rate-limit injects 'RateLimit-Limit' into the headers
    expect(response.headers).toHaveProperty('ratelimit-limit');
    expect(response.headers['ratelimit-limit']).toBe('100');
  });

  // Add your Auth test here!
  // it('Should block requests missing a valid JWT token', async () => { ... })
});
