import { Request, Response, NextFunction } from 'express';

/** Used by services and middleware to signal HTTP errors with a status code. */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Central error middleware: maps AppError to status + JSON; logs and returns 500 for unknown errors. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}
