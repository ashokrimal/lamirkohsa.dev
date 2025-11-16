export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message || 'An error occurred');
  }
  
  return new AppError('An unknown error occurred');
};

export const handleNotFound = (message: string = 'Resource not found') => {
  return new AppError(message, 404);
};

export const handleUnauthorized = (message: string = 'Unauthorized') => {
  return new AppError(message, 401);
};
