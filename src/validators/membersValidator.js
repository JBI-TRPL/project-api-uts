import { body } from 'express-validator';

export const createOrUpdateMemberRules = [
    body('name').isString().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional().isString()
];