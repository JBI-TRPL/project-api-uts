import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Use process.cwd() as project root so this file works regardless of import.meta support
const __dirname = process.cwd();

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'library.db');
sqlite3.verbose();
export const db = new sqlite3.Database(dbPath);

export const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, changes: this.changes });
        });
    });

export const get = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });

export const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

export async function initDB() {
    await run('PRAGMA foreign_keys = ON');

    await run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      category TEXT,
      isbn TEXT UNIQUE,
      published_year INTEGER,
      copies_total INTEGER NOT NULL DEFAULT 1,
      copies_available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

    await run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

    await run(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      loan_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

    // Seed data if tables are empty
    const booksCount = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(1) as cnt FROM books', (err, row) => err ? reject(err) : resolve(row ? row.cnt : 0));
    });

    const membersCount = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(1) as cnt FROM members', (err, row) => err ? reject(err) : resolve(row ? row.cnt : 0));
    });

    if (booksCount === 0 || membersCount === 0) {
        // wrap in a transaction for speed
        await run('BEGIN TRANSACTION');
        try {
            if (booksCount === 0) {
                const sampleCategories = ['Fiction', 'Non-fiction', 'Science', 'History', 'Children'];
                for (let i = 1; i <= 20; i++) {
                    const title = `Sample Book ${i}`;
                    const author = `Author ${i}`;
                    const category = sampleCategories[i % sampleCategories.length];
                    const isbn = `ISBN-0000-${i.toString().padStart(4, '0')}`;
                    const year = 2000 + (i % 25);
                    const copies = (i % 3) + 1;
                    await run(`INSERT INTO books (title, author, category, isbn, published_year, copies_total, copies_available) VALUES (?, ?, ?, ?, ?, ?, ?)`, [title, author, category, isbn, year, copies, copies]);
                }
            }

            if (membersCount === 0) {
                for (let j = 1; j <= 10; j++) {
                    const name = `Member ${j}`;
                    const email = `member${j}@example.com`;
                    const phone = `+62-812-0000-${j.toString().padStart(4, '0')}`;
                    await run(`INSERT INTO members (name, email, phone) VALUES (?, ?, ?)`, [name, email, phone]);
                }
            }

            await run('COMMIT');
        } catch (e) {
            await run('ROLLBACK');
            throw e;
        }
    }
}