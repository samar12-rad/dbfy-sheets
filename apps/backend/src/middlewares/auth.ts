
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
        return;
    }
};
