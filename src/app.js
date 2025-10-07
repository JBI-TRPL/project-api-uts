import express from 'express';
import booksRoutes from './routes/booksRoutes.js';
import membersRoutes from './routes/membersRoutes.js';
import loansRoutes from './routes/loansRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
app.use(express.json());

// Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/books', booksRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/loans', loansRoutes);

// 404 & error handlers
app.use(notFound);
app.use(errorHandler);

export default app;