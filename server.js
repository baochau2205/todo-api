require("dotenv").config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const[type, token] = header.split(" ");
    if (type !=="Bearer" || !token) {
        return next(createError(401, "Not logged in"));
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        next(createError(401, "Invalid or expired token"));
    }
}
jobsRouter.post("/", requireAuth, validateJob, (req, res) => {
    const job = { id: Date.now(), ...req.body, title: req.body.title.trim() };
    jobs.push(job);
    sendSuccess(res, job, 201);
});

jobsRouter.put("/:id", requireAuth, validateId, validateJob, (req, res, next) => {
    const job = jobs.find(j => j.id === req.jobId);
    if (!job) return next(createError(404, "Không tìm thấy job"));
    Object.assign(job, req.body, { title: req.body.title.trim() });
    sendSuccess(res, job);
});

jobsRouter.delete("/:id", requireAuth, validateId, (req, res, next) => {
    const index = jobs.findIndex(j => j.id === req.jobId);
    if (index === -1) return next(createError(404, "không tìm thấy job"));
    const [deleted] = jobs.splice(index, 1);
    sendSuccess(res, deleted);
});

const users = []; 
const authRouter = express.Router();

authRouter.post("/register", async (req, res, next) => {
    try { 
        const { email, password } = req.body;
        if (!email || !password || password.length < 6) {
            return next(createError(400, "Email and password (min 6 characters) are required"));
        }
        if (users.some((u) => u.email === email)) {
            return next(createError(409, "Email has been registered"))
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = { id: Date.now(), email, passwordHash };
        users.push(user);
        sendSuccess(res, { id: user.id, email: user.email }, 201);
    } catch (err) { next(err); }
});

authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = users.find((u) => u.email === email);
        const ok = user && (await bcrypt.compare(password, user.passwordHash));
        if (!ok) return next(createError(401, "Incorrect email or password"));
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        sendSuccess(res, { token });
    } catch (err) { next(err); }
});
authRouter.get("/me", requireAuth, (req, res) => {
    sendSuccess(res, req.user);
});

app.use("/api/v1/jobs", jobsRouter);
app.use("/api/v1/auth", authRouter);

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