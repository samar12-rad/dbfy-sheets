
import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);

    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'Something went wrong';

    res.status(statusCode).json({
        error: {
            code,
            message
        }
    });
};
