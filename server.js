const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

function createError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

function validateJob(req, res, next) {
    const { title } = req.body;
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Title không được trống"})
    }
    next();
}

function validateId(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(createError(400, "ID phải là số"))
    req.jobId = id;
    next();
}

app.get("/", (req, res) => res.send("Hello API"));
let jobs = [{ id: 1, title: "Frontend Intern" }];
app.get("/jobs", (req, res) => res.json(jobs));

app.get("/jobs/:id", validateId, (req, res, next) => {
    const job = jobs.find(j => j.id === req.jobId);
    if (!job) return next(createError(404, "Không tìm thấy job"));
    res.json(job);
});

app.post("/jobs", validateJob, (req, res) => {
    const job = { id: Date.now(), ...req.body, title: req.body.title.trim() };
    jobs.push(job);
    res.status(201).json(job);
});

app.put("/jobs/:id", validateId, validateJob, (req, res, next) => {
    const job = jobs.find(j => j.id === req.jobId);
    if (!job) return next(createError(404, "Không tìm thấy job"));
    Object.assign(job, req.body, { title: req.body.title.trim() });
    res.json(job);
});

app.delete("/jobs/:id", validateId, (req, res, next) => {
    const index = jobs.findIndex(j => j.id === req.jobId);
    if (index === -1) return next(createError(404, "Không tìm thấy job"));
    jobs.splice(index, 1);
    res.status(204).end();
});

app.use((req, res, next) => {
    next(createError(404, "Không tìm thấy route"));
});

app.use((err, req, res, next) => {
    console.error("X", err.message);
    res.status(err.status || 500).json({ error: err.message || "Lỗi server" });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));