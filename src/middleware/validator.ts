import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware to handle validation errors
 * Returns a 400 response with field-specific error messages
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
    return;
  }

  next();
};

/**
 * Wrapper to combine validation chains with error handling
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    for (const validation of validations) {
      await validation.run(req);
    }

    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
      return;
    }

    next();
  };
};
