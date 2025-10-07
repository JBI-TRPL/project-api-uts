import { Router } from 'express';
import { validationResult } from 'express-validator';
import {
    listLoans,
    getLoan,
    createLoan,
    returnLoan,
    deleteLoan
} from '../repositories/loansRepo.js';
import { createLoanRules } from '../validators/loansValidator.js';

const router = Router();

router.get('/', async(req, res, next) => {
    try {
        res.json(await listLoans());
    } catch (e) { next(e); }
});

router.get('/:id', async(req, res, next) => {
    try {
        const row = await getLoan(req.params.id);
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
});

router.post('/', createLoanRules, async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const created = await createLoan(req.body);
        res.status(201).json(created);
    } catch (e) { next(e); }
});

router.post('/:id/return', async(req, res, next) => {
    try {
        const returned = await returnLoan(req.params.id);
        if (!returned) return res.status(404).json({ error: 'Not found' });
        res.json(returned);
    } catch (e) { next(e); }
});

router.delete('/:id', async(req, res, next) => {
    try {
        const ok = await deleteLoan(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (e) { next(e); }
});

export default router;