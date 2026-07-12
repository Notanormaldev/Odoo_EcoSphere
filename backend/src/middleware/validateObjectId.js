import { isValidObjectId } from '../utils/validators.js';
import { AppError } from './errorHandler.js';

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!isValidObjectId(id)) {
      return next(new AppError(`Invalid database ID: ${id}`, 400));
    }
    next();
  };
};
