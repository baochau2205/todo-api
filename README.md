![CI](https://github.com/baochau2205/job-board/actions/workflows/ci.yml/badge.svg)

# Job Board

A fullstack job board where employers post jobs and candidates apply with their CV, with real-time updates.

## Features

- Register and log in with JWT authentication
- Create, edit and delete your own job posts (owner-only permissions)
- Apply to jobs with a PDF CV upload
- Real-time updates with Socket.io: new jobs appear instantly, employers get notified of new applicants
- Search jobs by title

## Tech Stack

- **Frontend:** React, Vite, React Router, Context API
- **Backend:** Node.js, Express, Socket.io, Multer, JWT, bcrypt
- **Database:** PostgreSQL
- **Testing:** Jest, Supertest, Vitest, React Testing Library
- **DevOps:** Docker, Docker Compose, GitHub Actions

## Run Locally

### With Docker

```bash
docker compose up --build
```

API runs at `http://localhost:3000`.

### Without Docker

```bash
npm install
npm run dev

cd jobs-client
npm install
npm run dev
```

## Tests

```bash
npm test                 # API tests (Jest + Supertest)
cd jobs-client && npx vitest run   # React tests
```