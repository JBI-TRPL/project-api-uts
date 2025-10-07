import { Router } from 'express';
import { validationResult } from 'express-validator';
import {
    listMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember
} from '../repositories/membersRepo.js';
import { createOrUpdateMemberRules } from '../validators/membersValidator.js';

const router = Router();

router.get('/', async(req, res, next) => {
    try {
        res.json(await listMembers());
    } catch (e) { next(e); }
});

router.get('/:id', async(req, res, next) => {
    try {
        const row = await getMember(req.params.id);
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
});

router.post('/', createOrUpdateMemberRules, async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const created = await createMember(req.body);
        res.status(201).json(created);
    } catch (e) { next(e); }
});

router.put('/:id', createOrUpdateMemberRules, async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const updated = await updateMember(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (e) { next(e); }
});

router.delete('/:id', async(req, res, next) => {
    try {
        const ok = await deleteMember(req.params.id);
        if (!ok) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (e) { next(e); }
});

export default router;