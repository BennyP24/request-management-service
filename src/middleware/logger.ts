import { Request, Response, NextFunction } from 'express';

/** Logs each request: method, URL, status code, and duration when the response finishes. */
export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
}
