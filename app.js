require("dotenv").config();
const upload = require('./middleware/upload');
const createError = require('./utils/createError');
const { requireAuth } = require('./middleware/auth');
const multer = require('multer');
const express = require('express');
const pool = require("./db");
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

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
const jobsRouter = express.Router();

jobsRouter.get("/mine", requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM jobs WHERE created_by = $1 ORDER BY id DESC",
            [req.user.id]
        );
        sendSuccess(res, result.rows);
    } catch (err) { next(err); }
});

jobsRouter.get("/", async (req, res, next) => {
    try {
        const { search } = req.query;
        const base = `SELECT jobs.*, users.email AS posted_by
                    FROM jobs LEFT JOIN users ON users.id = jobs.created_by`;
        const result = search
        ? await pool.query(`${base} WHERE jobs.title ILIKE $1 ORDER BY jobs.id`, [`%${search}%`])
        : await pool.query(`${base} ORDER BY jobs.id`);
        sendSuccess(res, result.rows);
    } catch (err) { next(err); }
});

jobsRouter.post("/", requireAuth, validateJob, async (req, res, next) => {
    try {
        const { title, company, salary, remote } = req.body;
        const result = await pool.query(
            `INSERT INTO jobs (title, company, salary, remote, created_by)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title.trim(), company, salary, remote ?? false, req.user.id]
        );
        const job = result.rows[0];
        req.app.get('io').emit('job:created', { ...job, posted_by: req.user.email });
        sendSuccess(res, job, 201);
    } catch (err) { next(err); }
});

jobsRouter.post("/:id/apply", requireAuth, validateId, upload.single('cv'), async (req, res, next) => {
    try {
        const cvUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const result = await pool.query(
            "INSERT INTO applications (user_id, job_id, cv_url) VALUES ($1, $2, $3) RETURNING *",
            [req.user.id, req.jobId, cvUrl]
        );

        // Buổi 22: báo riêng cho chủ job
        const jobRes = await pool.query("SELECT created_by, title FROM jobs WHERE id = $1", [req.jobId]);
        const job = jobRes.rows[0];
        req.app.get('io').to(`user:${job.created_by}`).emit('application:new', {
            jobId: req.jobId,
            jobTitle: job.title,
            from: req.user.email,
        });

        sendSuccess(res, result.rows[0], 201);
    } catch (err) {
        if (err.code === "23505") return next(createError(409, "Applied to this job"));
        if (err.code === "23503") return next(createError(404, "Job Not Found"));
        next(err);
    }
});

async function requireOwner(req, res, next) {
    try {
        const result = await pool.query("SELECT created_by FROM jobs WHERE id = $1", [req.jobId]);
        if (result.rows.length === 0) return next(createError(404, "Job Not Found"));
        if (result.rows[0].created_by !== req.user.id) {
            return next(createError(403, "No access to this job"));
        }
        next();
    } catch (err) {next(err); }
}

jobsRouter.put("/:id", requireAuth, validateId, requireOwner, validateJob, async (req,res,next) => {
    try {
        const { title, company, salary, remote } = req.body;
        const result = await pool.query(
            `UPDATE jobs
            SET title = $1,
            company = COALESCE($2, company),
            salary = COALESCE($3, salary),
            remote = COALESCE($4, remote)
            WHERE id = $5 RETURNING *`,
            [title.trim(), company, salary, remote, req.jobId]
        );
        if (result.rows.length === 0) return next(createError(404, "Job Not Found"));
        sendSuccess(res, result.rows[0]);
    } catch (err) {next(err); }
});

jobsRouter.delete("/:id", requireAuth, validateId, requireOwner, async (req, res, next) => {
    try {
        const result = await pool.query("DELETE FROM jobs WHERE id = $1 RETURNING *", [req.jobId]);
        if (result.rowCount === 0) return next(createError(404, "Job Not Found"));
        req.app.get('io').emit('job:deleted', { id: req.jobId }); // Buổi 22
        sendSuccess(res, result.rows[0]);
    } catch (err) {next(err); }
});

const authRouter = express.Router();

authRouter.post("/register", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password || password.length < 6) {
            return next(createError(400, "Email and password (min 6 characters) are required"));
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
            [email, passwordHash]
        );
        sendSuccess(res, result.rows[0], 201);
    } catch (err) {
        if (err.code === "23505") return next(createError(409, "Email has been registered"));
        next(err);
    }
});

authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        const ok = user && (await bcrypt.compare(password, user.password_hash));
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

jobsRouter.get("/:id", validateId, async (req, res, next) => {
    try {
        const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.jobId]);
        if (result.rows.length === 0) return next(createError(404, "Job Not Found"));
        sendSuccess(res, result.rows[0]);
    } catch (err) { next(err); }
});

authRouter.get("/me/applications", requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT applications.id, applications.status, applications.created_at,
                    jobs.title, jobs.company
             FROM applications JOIN jobs ON jobs.id = applications.job_id
             WHERE applications.user_id = $1
             ORDER BY applications.created_at DESC`,
            [req.user.id]
        );
        sendSuccess(res, result.rows);
    } catch (err) { next(err); }
});

app.use('/uploads', express.static('uploads'));
app.post('/api/v1/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, data: null, error: "File not selected" });
    }
    sendSuccess(res, { url: `/uploads/${req.file.filename}`}, 201);
});

app.use("/api/v1/jobs", jobsRouter);
app.use("/api/v1/auth", authRouter);
app.get("/api/v1/health/db", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW()");
        sendSuccess(res, { time: result.rows[0].now });
    } catch (err) {
        next(err);
    }
});
app.use((req, res, next) => {
    next(createError(404, "Không tìm thấy router"));
});

app.use((err, req, res, next) => {
    if ( err instanceof multer.MulterError) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Max file size is 2MB' : err.message;
        return res.status(400).json({ success: false, data: null, error: msg });
    }
    const status = err.status || 500;
    if ( status === 500) console.error(err);
    res.status(status).json({
        success:false, 
        data: null,
        error: status === 500 ? "Lỗi server" : err.message,
    });
});

module.exports = app;