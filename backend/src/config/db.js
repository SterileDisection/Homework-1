const mongoose = require('mongoose');

const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * Connects to MongoDB and makes sure every collection and index exists.
 *
 * MongoDB creates a database the first time something is written to it, so an
 * empty or nonexistent database is fine. Model.init() creates the collection
 * (if missing) and builds the indexes declared in each schema (unique student
 * IDs, unique course IDs, unique student+course enrollments). We await it
 * before the server starts listening so duplicate checks are enforced from
 * the very first request. No manual setup or seed step is needed.
 */
async function connectDB(uri) {
    if (!uri) {
        throw new Error('MONGODB_URI is not set. Add it to backend/.env.');
    }

    // Fail fast (5s) with a clear message if MongoDB isn't running.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

    // Log connection problems that happen while the server is running.
    mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
    mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

    await Promise.all([Student.init(), Course.init(), Enrollment.init()]);

    console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
}

async function disconnectDB() {
    await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
