const fs = require('fs');
const path = require('path');

// Load backend/.env no matter which folder the server is started from.
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
    try {
        // Connect (and create collections/indexes) before accepting requests.
        await connectDB(process.env.MONGODB_URI);
    } catch (error) {
        console.error('Could not connect to MongoDB:', error.message);
        console.error('Make sure MongoDB Community Edition is running and MONGODB_URI in backend/.env is correct.');
        process.exit(1);
    }

    const server = app.listen(PORT, (error) => {
        // Express 5 also calls this callback when listening fails (e.g. port in use).
        // That case is reported by the 'error' handler below, so don't claim success.
        if (error) return;
        console.log(`Server is running on http://localhost:${PORT}`);
        if (!fs.existsSync(path.join(app.distDir, 'index.html'))) {
            console.warn('Warning: frontend/dist was not found. Run "npm run build" so the app can be served.');
        }
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env.`);
        } else {
            console.error('Server error:', error);
        }
        process.exit(1);
    });

    // Close the server and the database connection cleanly on Ctrl+C.
    const shutdown = async () => {
        console.log('Shutting down...');
        server.close();
        await disconnectDB();
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

start();
