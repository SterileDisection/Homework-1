const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

// ---------------------------------------------------------------------------
// REST API
// ---------------------------------------------------------------------------

// Quick way to confirm the API is up and connected to MongoDB.
app.get('/api/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({ status: 'ok', database: states[mongoose.connection.readyState] || 'unknown' });
});

app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));

// Unknown /api/... URLs get a JSON 404 (never the Vue page).
app.use('/api', notFound);

// ---------------------------------------------------------------------------
// Vue production build (created by `npm run build` in frontend/dist)
// ---------------------------------------------------------------------------
const distDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
const indexHtml = path.join(distDir, 'index.html');

// Vite puts a content hash in asset file names (e.g. index-BUok-nX1.js), so a
// changed file always gets a new name. That makes it safe to let browsers cache
// /assets/* for a long time. index.html itself is never cached, so a new build
// is picked up on the next page load.
app.use(
    express.static(distDir, {
        index: false, // "/" is handled by the fallback below
        setHeaders(res, filePath) {
            if (filePath.includes(`${path.sep}assets${path.sep}`)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        },
    })
);

// History-mode fallback: Vue Router uses real URLs like /courses, which don't
// exist as files. For any other GET page request, return index.html and let
// Vue Router show the right view -- so refreshing /courses doesn't 404.
app.use((req, res, next) => {
    const isPageRequest = (req.method === 'GET' || req.method === 'HEAD') && !path.extname(req.path);
    if (!isPageRequest) {
        return next(); // e.g. a missing /assets/file.js -> plain 404 below
    }

    if (!fs.existsSync(indexHtml)) {
        return res
            .status(503)
            .type('text')
            .send('The frontend has not been built yet. Run "npm run build" in the project folder, then restart the server.');
    }

    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexHtml);
});

// Anything left (e.g. a missing image or script file) is a 404.
app.use((req, res) => {
    res.status(404).type('text').send('Not found');
});

// Must be registered last.
app.use(errorHandler);

module.exports = app;
module.exports.distDir = distDir;
