# Library API

Simple Library API built with Node.js, Express and SQLite.

## Quick start

Requirements:
- Node.js (16+ recommended)
- npm

Install and run:

```bash
npm install
npm run dev    # starts with nodemon
# or
npm start      # runs node src/server.js
```

The API is available at `http://localhost:3000/api` by default.

## Health

GET /api/health

Response:
```json
{ "status": "ok", "timestamp": "2025-10-07T..." }
```

## Books

Base: /api/books

- GET /api/books
  - List all books
  - Response: array of book objects

- GET /api/books/:id
  - Get a single book by id
  - 404 if not found

- POST /api/books
  - Create a book
  - Body (JSON):
    - title (string, required)
    - author (string, optional)
    - category (string, optional)
    - isbn (string, optional)
    - published_year (int, optional)
    - copies_total (int, optional, default 1)
  - 201 Created with created object

- PUT /api/books/:id
  - Update book fields (same body as POST)
  - 404 if not found

- DELETE /api/books/:id
  - Delete book (fails if active loan exists)
  - 404 if not found

Example curl create:

```bash
curl -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"My Book","author":"Me","copies_total":2}'
```

## Members

Base: /api/members

- GET /api/members
  - List all members

- GET /api/members/:id
  - Get member by id

- POST /api/members
  - Create member
  - Body:
    - name (string, required)
    - email (string, optional, must be email)
    - phone (string, optional)
  - 201 Created

- PUT /api/members/:id
  - Update member fields (same body as POST)

- DELETE /api/members/:id
  - Delete member (fails if member has active loans)

Example create member:

```bash
curl -X POST http://localhost:3000/api/members -H "Content-Type: application/json" -d '{"name":"Jane","email":"jane@example.com"}'
```

## Loans

Base: /api/loans

- GET /api/loans
  - List loans

- GET /api/loans/:id
  - Get loan by id

- POST /api/loans
  - Create loan
  - Body:
    - member_id (int, required)
    - book_id (int, required)
    - days (int, optional, default used by server)
  - 201 Created

- POST /api/loans/:id/return
  - Mark loan returned
  - 404 if not found

- DELETE /api/loans/:id
  - Delete loan

Example create loan:

```bash
curl -X POST http://localhost:3000/api/loans -H "Content-Type: application/json" -d '{"member_id":1,"book_id":2,"days":14}'
```

## Errors and validation

- Validation errors: 400 with `{ errors: [...] }` from `express-validator`.
- Not found: 404 with `{ error: 'Not found' }`.
- Business errors (like deleting while active loans exist) return an error with status and message.

## Notes

- Database file is stored in `data/library.db` (created automatically on first run).
- If you need modern syntax (nullish coalescing `??` or import.meta.url), ensure Node.js and your tooling support it.

---

If mau, saya bisa tambahkan contoh response body lengkap untuk setiap resource dan Postman collection / OpenAPI spec. Let me know which one you prefer.
