
import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authenticateUser } from '../middlewares/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();
router.use(authenticateUser);

// Global Logs
router.get('/', async (req: Request, res: Response) => {
    const userId = req.user!.id;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
            [userId]
        );
        res.json({ data: rows });
    } catch (error) {
        console.error('Fetch logs error:', error);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch logs' } });
    }
});

export default router;

// Also need to add sheet-specific logs to sheets.ts or here?
// The requirement was "per sheet logs page".
// I'll add `GET /sheets/:id/logs` in sheets.ts.
