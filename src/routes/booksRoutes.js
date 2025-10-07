import { Router } from 'express';
import { validationResult } from 'express-validator';
import {
    listBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
} from '../repositories/booksRepo.js';
import { createOrUpdateBookRules } from '../validators/booksValidator.js';

const router = Router();

router.get('/', async(req, res, next) => {
    try {
        const rows = await listBooks();
        res.json(rows);
    } catch (e) { next(e); }
});

router.get('/:id', async(req, res, next) => {
    try {
        const row = await getBook(req.params.id);
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
});

router.post('/', createOrUpdateBookRules, async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const created = await createBook(req.body);
        res.status(201).json(created);
    } catch (e) { next(e); }
});

router.put('/:id', createOrUpdateBookRules, async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const updated = await updateBook(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (e) { next(e); }
});

router.delete('/:id', async(req, res, next) => {
    try {
        const ok = await deleteBook(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (e) { next(e); }
});

export default router;