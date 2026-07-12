import { validateObjectId } from '../middleware/validateObjectId.js';

describe('validateObjectId Middleware', () => {
  it('should call next() without error if ID is a valid MongoDB ObjectId', () => {
    const req = { params: { id: '60c72b2f9b1d8e1f8c8d8f9a' } };
    const res = {};
    const next = jest.fn();

    const middleware = validateObjectId('id');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next() with AppError if ID is an invalid MongoDB ObjectId', () => {
    const req = { params: { id: 'invalid_mongo_id' } };
    const res = {};
    const next = jest.fn();

    const middleware = validateObjectId('id');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
