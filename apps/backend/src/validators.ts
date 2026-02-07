
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const createSheetSchema = z.object({
    name: z.string().min(1)
});

export const addRowSchema = z.object({
    row_index: z.number().int().nonnegative()
});

export const updateCellSchema = z.object({
    row_id: z.number().int().positive(),
    column_key: z.string().min(1),
    value: z.string() // Assuming string values for cells? Plan implied string.
});

// Middleware factory
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error: any) {
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
            }
        });
    }
};
