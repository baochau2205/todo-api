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

function sendSuccess(res, data, status = 200) {
    res.status(status).json({ success: true, data, error: null });
}

function validateJob(req, res, next) {
    const { title } = req.body;
    if (!title || title.trim() === "") {
        return next(createError(400, "Title không được trống"));
    }
    next();
}

function validateId(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(createError(400, "ID phải là số"))
    req.jobId = id;
    next();
}

app.get("/", (req, res) => sendSuccess(res, { message: "Jobs API" }));
let jobs = [{ id: 1, title: "Frontend Intern" }];
const jobsRouter = express.Router();
jobsRouter.get("/", (req, res) => {
    const { search } = req.query;
    const result = search 
    ? jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()))
    : jobs;
    sendSuccess(res, result);
});
jobsRouter.get("/:id", validateId, (req, res, next) => {
    const job = jobs.find(j => j.id === req.jobId);
    if (!job) return next(createError(404, "Không tìm thấy job"));
    sendSuccess(res, job);
});

jobsRouter.post("/", validateJob, (req, res) => {
    const job = { id: Date.now(), ...req.body, title: req.body.title.trim() };
    jobs.push(job);
    sendSuccess(res, job, 201);
});

jobsRouter.put("/:id", validateId, validateJob, (req, res, next) => {
    const job = jobs.find(j => j.id === req.jobId);
    if (!job) return next(createError(404, "Không tìm thấy job"));
    Object.assign(job, req.body, { title: req.body.title.trim() });
    sendSuccess(res, job);
});

jobsRouter.delete("/:id", validateId, (req, res, next) => {
    const index = jobs.findIndex(j => j.id === req.jobId);
    if (index === -1) return next(createError(404, "không tìm thấy job"));
    const [deleted] = jobs.splice(index, 1);
    sendSuccess(res, deleted);
});

app.use("/api/v1/jobs", jobsRouter);

app.use((req, res, next) => {
    next(createError(404, "Không tìm thấy router"));
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    if ( status === 500) console.error(err);
    res.status(status).json({
        success:false, 
        data: null,
        error: status === 500 ? "Lỗi server" : err.message,
    });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));