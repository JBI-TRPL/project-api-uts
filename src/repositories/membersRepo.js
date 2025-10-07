import { run, get, all } from '../db.js';

export async function listMembers() {
    return all(`SELECT * FROM members ORDER BY id DESC`);
}

export async function getMember(id) {
    return get(`SELECT * FROM members WHERE id = ?`, [id]);
}

export async function createMember({ name, email = null, phone = null }) {
    const { id } = await run(
        `INSERT INTO members (name, email, phone) VALUES (?, ?, ?)`, [name, email, phone]
    );
    return getMember(id);
}

export async function updateMember(id, payload) {
    const current = await getMember(id);
    if (!current) return null;

    const updated = {
        name: (payload.name !== undefined && payload.name !== null) ? payload.name : current.name,
        email: (payload.email !== undefined && payload.email !== null) ? payload.email : current.email,
        phone: (payload.phone !== undefined && payload.phone !== null) ? payload.phone : current.phone
    };

    await run(
        `UPDATE members SET name=?, email=?, phone=? WHERE id=?`, [updated.name, updated.email, updated.phone, id]
    );
    return getMember(id);
}

export async function deleteMember(id) {
    // prevent delete if member has active loan
    const active = await get(
        `SELECT 1 FROM loans WHERE member_id = ? AND return_date IS NULL LIMIT 1`, [id]
    );
    if (active) {
        const err = new Error('Cannot delete: member has active loans');
        err.status = 400;
        throw err;
    }
    const res = await run(`DELETE FROM members WHERE id = ?`, [id]);
    return res.changes > 0;
}