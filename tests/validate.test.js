import { describe, expect, test, jest } from '@jest/globals';
import { validateProductPayload } from '../middlewares/validate.js';

describe('validateProductPayload', () => {
  test('normalizes and accepts a valid product payload', () => {
    const req = { body: { name: '  Leather Wallet  ', price: '499', stock: '20' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    validateProductPayload(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ name: 'Leather Wallet', price: 499, stock: 20 });
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rejects a payload that is missing required fields', () => {
    const req = { body: { name: 'Leather Wallet' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    validateProductPayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Bad Request' }));
  });
});
