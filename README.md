# Student Management System

CIS 3339 Homework 1: a full-stack app for managing students, courses, and enrollments.

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vue Router, Pinia, built with Vite
- **Backend:** Node.js, Express 5, REST API
- **Database:** MongoDB Community Edition (local), accessed with Mongoose

**Open the app at: <http://localhost:3000>** (after the build and start steps below)

---

## Required software

| Software | Version | Notes |
|---|---|---|
| Node.js | 20.19+ or 22.12+ | Required by Vite 8. Includes npm. Check with `node -v`. |
| npm | 10+ | Comes with Node.js. |
| MongoDB Community Edition | 7.0 or newer (tested with 8.3) | Must be running locally on the default port 27017. No Atlas, cloud database, or login is needed. |

## Environment variables

The app reads its configuration from **`backend/.env`**. This file is committed to the repository and already holds a working local setup. You don't need to create or edit it.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | – | Connection string for the local MongoDB database. The `cis3339_homework1` database is created automatically. |
| `PORT` | No | `3000` | Port the Express server listens on. |

The file has no passwords or other secrets.

---

## Quick start

From the project's root folder (the one containing this README):

```bash
npm install      # installs root, backend, and frontend dependencies
npm run build    # builds the Vue production files into frontend/dist
npm start        # starts the Express server
```

Then open **<http://localhost:3000>**.

You **don't** need to create the database, collections, or indexes, or run any seed or migration command. On startup the server connects to MongoDB and creates everything it needs, even when the `cis3339_homework1` database is empty or doesn't exist yet.

Stop the server with `Ctrl+C`.

### 1. Start MongoDB Community Edition

MongoDB must be running before you run `npm start`.

- **Windows:** the installer normally sets MongoDB up as a Windows service that starts automatically. To start it manually, open PowerShell **as Administrator** and run:
  ```powershell
  net start MongoDB
  ```
  You can also start "MongoDB Server" from the Services app (`services.msc`).
- **macOS (Homebrew):**
  ```bash
  brew services start mongodb-community
  ```
- **Linux (systemd):**
  ```bash
  sudo systemctl start mongod
  ```

Optional check: if `mongosh` is installed, `mongosh --eval "db.runCommand({ ping: 1 })"` should print `{ ok: 1 }`.

### 2. Install dependencies

```bash
npm install
```

This runs a `postinstall` script that also installs `backend/` and `frontend/` dependencies, so one command is enough.

### 3. Build the production frontend

```bash
npm run build
```

This compiles the Vue app into `frontend/dist`.

### 4. Start the server

```bash
npm start
```

Expected output:

```
Connected to MongoDB database "cis3339_homework1"
Server is running on http://localhost:3000
```

Open **<http://localhost:3000>**. The single Express server serves both the Vue app and the REST API (`/api/...`). Refreshing any page (for example `/courses`) works and doesn't return a 404.

---

## Features

| Area | What you can do |
|---|---|
| **Students** | Add a student (name, student ID, phone, ZIP), search by part of a name or by exact student ID, view all students, and delete a student. Required fields and formats are validated, and duplicate student IDs are rejected. |
| **Courses** | Add a course (course ID, name), list all courses, and delete a course. Duplicate course IDs are rejected; `cis  3339` and `CIS 3339` count as the same ID. |
| **Enrollments** | Choose a student and a course from dropdowns filled with data from the database, then enroll. Duplicate enrollments are rejected. Select a course to see every student enrolled in it, and unenroll students. |
| **Data integrity** | Enrollments can only reference existing students and courses. Deleting a student or course also deletes their enrollments. |
| **Interface** | Responsive layout for desktop and phone, labeled and keyboard-accessible controls, loading/success/error/empty states, confirmation before deleting, and automatic light/dark theme. |

## Development mode (optional)

For live reloading while editing code, run the backend and frontend in two terminals:

```bash
npm run dev:backend    # Express API on http://localhost:3000 (restarts on changes)
npm run dev:frontend   # Vite dev server on http://localhost:5173
```

Open <http://localhost:5173>. The Vite dev server forwards `/api` requests to Express on port 3000.

---

## Project structure

```
├── package.json              # Root scripts: install, build, start
├── backend/
│   ├── .env                  # Local MongoDB configuration (committed)
│   ├── server.js             # Entry point: loads .env, connects to MongoDB, starts Express
│   └── src/
│       ├── app.js            # Express app: API routes, serves frontend/dist, history fallback
│       ├── config/db.js      # MongoDB connection; creates collections and indexes on startup
│       ├── models/           # Mongoose schemas: Student, Course, Enrollment
│       ├── routes/           # REST endpoints: students, courses, enrollments
│       ├── middleware/       # Shared JSON error handling
│       └── utils/            # Request validation helpers
└── frontend/
    ├── index.html
    ├── vite.config.js        # Build config and dev proxy
    └── src/
        ├── main.js           # Creates the Vue app with Pinia and Vue Router
        ├── App.vue           # Layout: header, page area, notifications, confirm dialog
        ├── router/           # Routes for each view
        ├── stores/           # Pinia stores: students, courses, enrollments, ui
        ├── api/              # HTTP client and endpoint functions
        ├── views/            # Dashboard, Students, Courses, Enrollments, Not Found
        ├── components/       # Feature components and reusable UI components
        ├── composables/      # useForm: shared form validation/submission logic
        └── utils/            # Validators and formatting helpers
```

## REST API

All endpoints accept and return JSON. Errors have the form `{ "error": "message", "details": { ... } }`.

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/health` | Server and database status | 200 | |
| GET | `/api/students?search=` | List students, or search by name (partial, any case) or exact student ID | 200 | 400 |
| GET | `/api/students/:id` | Get one student | 200 | 400, 404 |
| POST | `/api/students` | Add a student `{ name, studentId, phone, zip }` | 201 | 400, 409 |
| DELETE | `/api/students/:id` | Delete a student and their enrollments | 200 | 400, 404 |
| GET | `/api/courses` | List courses | 200 | |
| GET | `/api/courses/:id` | Get one course | 200 | 400, 404 |
| GET | `/api/courses/:id/students` | Course roster | 200 | 400, 404 |
| POST | `/api/courses` | Add a course `{ courseId, name }` | 201 | 400, 409 |
| DELETE | `/api/courses/:id` | Delete a course and its enrollments | 200 | 400, 404 |
| GET | `/api/enrollments?course=&student=` | List enrollments, optionally filtered | 200 | 400 |
| POST | `/api/enrollments` | Enroll `{ student, course }` (MongoDB ids) | 201 | 400, 404, 409 |
| DELETE | `/api/enrollments/:id` | Unenroll | 200 | 400, 404 |

`:id` is the document's MongoDB `_id`. Status codes: 400 = invalid input, 404 = not found, 409 = duplicate, 503 = database unavailable.

## Data model

| Collection | Fields | Rules |
|---|---|---|
| `students` | `name`, `studentId`, `phone`, `zip` | All required. `studentId` is unique (unique index). Phone and ZIP formats are validated. |
| `courses` | `courseId`, `name` | Both required. `courseId` is unique, trimmed, and stored in capital letters. |
| `enrollments` | `student` (ref Student), `course` (ref Course) | The `{ student, course }` pair is unique, so a student can be enrolled in a course only once. |

All documents also store `createdAt` and `updatedAt`. Unique indexes are built when the server starts, so the database enforces duplicate rules even if two requests arrive at the same time.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not connect to MongoDB: connect ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running. Start it (see step 1) and run `npm start` again. |
| `Port 3000 is already in use` | Another program is using port 3000. Stop it, or change `PORT` in `backend/.env`. |
| The page says "The frontend has not been built yet" | Run `npm run build`, then `npm start`. |
| `npm run build` fails with a Node.js version error | Install Node.js 20.19+ or 22.12+. |
| A package is missing | Run `npm install` again from the root folder. |
