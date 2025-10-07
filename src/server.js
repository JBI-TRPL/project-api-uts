import app from './app.js';
import { initDB } from './db.js';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await initDB();
        app.listen(PORT, () => {
            console.log(`Library API running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
start();