import { body } from 'express-validator';

export const createOrUpdateBookRules = [
    body('title').isString().notEmpty(),
    body('copies_total').optional().isInt({ min: 1 }),
    body('published_year').optional().isInt({ min: 0 }),
    body('isbn').optional().isString(),
    body('author').optional().isString(),
    body('category').optional().isString()
];