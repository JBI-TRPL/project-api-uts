import { run, get, all } from '../db.js';

export async function listBooks() {
    return all(`SELECT * FROM books ORDER BY id DESC`);
}

export async function getBook(id) {
    return get(`SELECT * FROM books WHERE id = ?`, [id]);
}

export async function createBook(payload) {
    const {
        title,
        author = null,
        category = null,
        isbn = null,
        published_year = null,
        copies_total = 1
    } = payload;

    const { id } = await run(
        `INSERT INTO books (title, author, category, isbn, published_year, copies_total, copies_available)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [title, author, category, isbn, published_year, copies_total, copies_total]
    );
    return getBook(id);
}


export async function updateBook(id, payload) {
    const current = await getBook(id);
    if (!current) return null;

    const updated = {
        title: (payload.title !== undefined && payload.title !== null) ? payload.title : current.title,
        author: (payload.author !== undefined && payload.author !== null) ? payload.author : current.author,
        category: (payload.category !== undefined && payload.category !== null) ? payload.category : current.category,
        isbn: (payload.isbn !== undefined && payload.isbn !== null) ? payload.isbn : current.isbn,
        published_year: (payload.published_year !== undefined && payload.published_year !== null) ? payload.published_year : current.published_year,
        copies_total: (payload.copies_total !== undefined && payload.copies_total !== null) ? payload.copies_total : current.copies_total
    };

    // adjust available if total changed
    let copies_available = current.copies_available;
    if (payload.copies_total && payload.copies_total !== current.copies_total) {
        const diff = payload.copies_total - current.copies_total;
        copies_available = Math.max(0, current.copies_available + diff);
    }

    await run(
        `UPDATE books SET title=?, author=?, category=?, isbn=?, published_year=?, copies_total=?, copies_available=? WHERE id=?`, [
            updated.title, updated.author, updated.category, updated.isbn,
            updated.published_year, updated.copies_total, copies_available, id
        ]
    );
    return getBook(id);
}

export async function deleteBook(id) {
    // prevent delete if active loan exists
    const active = await get(
        `SELECT 1 FROM loans WHERE book_id = ? AND return_date IS NULL LIMIT 1`, [id]
    );
    if (active) {
        const err = new Error('Cannot delete: book has active loans');
        err.status = 400;
        throw err;
    }
    const res = await run(`DELETE FROM books WHERE id = ?`, [id]);
    return res.changes > 0;
}