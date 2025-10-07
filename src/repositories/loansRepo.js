import { run, get, all } from '../db.js';

export async function listLoans() {
    return all(`
    SELECT l.*, m.name AS member_name, b.title AS book_title
    FROM loans l
    JOIN members m ON m.id = l.member_id
    JOIN books b ON b.id = l.book_id
    ORDER BY l.id DESC
  `);
}

export async function getLoan(id) {
    return get(`
    SELECT l.*, m.name AS member_name, b.title AS book_title
    FROM loans l
    JOIN members m ON m.id = l.member_id
    JOIN books b ON b.id = l.book_id
    WHERE l.id = ?
  `, [id]);
}

export async function createLoan({ member_id, book_id, days = 14 }) {
    // check book availability
    const book = await get(`SELECT * FROM books WHERE id = ?`, [book_id]);
    if (!book) {
        const err = new Error('Book not found');
        err.status = 404;
        throw err;
    }
    if (book.copies_available < 1) {
        const err = new Error('No copies available');
        err.status = 400;
        throw err;
    }
    const member = await get(`SELECT * FROM members WHERE id = ?`, [member_id]);
    if (!member) {
        const err = new Error('Member not found');
        err.status = 404;
        throw err;
    }

    const loanDate = new Date();
    const dueDate = new Date(loanDate.getTime() + days * 24 * 60 * 60 * 1000);

    const { id } = await run(
        `INSERT INTO loans (member_id, book_id, loan_date, due_date)
     VALUES (?, ?, ?, ?)`, [
            member_id,
            book_id,
            loanDate.toISOString(),
            dueDate.toISOString()
        ]
    );

    // decrement copies_available
    await run(
        `UPDATE books SET copies_available = copies_available - 1 WHERE id = ?`, [book_id]
    );

    return getLoan(id);
}

export async function returnLoan(id) {
    const loan = await get(`SELECT * FROM loans WHERE id = ?`, [id]);
    if (!loan) return null;
    if (loan.return_date) return getLoan(id); // already returned

    await run(
        `UPDATE loans SET return_date = ? WHERE id = ?`, [new Date().toISOString(), id]
    );

    await run(
        `UPDATE books SET copies_available = copies_available + 1 WHERE id = ?`, [loan.book_id]
    );
    return getLoan(id);
}

export async function deleteLoan(id) {
    // If deleting an active loan, restore availability
    const loan = await get(`SELECT * FROM loans WHERE id = ?`, [id]);
    if (!loan) return false;

    if (!loan.return_date) {
        await run(
            `UPDATE books SET copies_available = copies_available + 1 WHERE id = ?`, [loan.book_id]
        );
    }

    const res = await run(`DELETE FROM loans WHERE id = ?`, [id]);
    return res.changes > 0;
}