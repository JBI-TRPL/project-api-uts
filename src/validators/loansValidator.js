import { body } from 'express-validator';

export const createLoanRules = [
    body('member_id').isInt({ min: 1 }),
    body('book_id').isInt({ min: 1 }),
    body('days').optional().isInt({ min: 1, max: 60 })
];