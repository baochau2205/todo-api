require("dotenv").config();
const express = require('express');
const pool = require("./db");
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
jobsRouter.get("/", async (req, res, next) => {
    try {
        const {search} = req.query;
        const result = search
        ? await pool.query("SELECT * FROM jobs WHERE title ILIKE $1 ORDER BY id", [`%${search}%`])
        : await pool.query("SELECT * FROM jobs ORDER BY id");
        sendSuccess(res, result.rows);
    } catch (err) {next(err);}
});

jobsRouter.get("/:id", validateId, async (req, res, next) => {
    try {
        const result = await pool.query("SELECT *FROM jobs WHERE id = $1", [req.jobId]);
        if (result.rows.length === 0) return next(createError(404, " Not Found"));
        sendSuccess(res, result.rows[0]);
    } catch (err) { next(err);}
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
jobsRouter.post("/", requireAuth, validateJob, async (req, res, next) => {
    try {
        const { title, company, salary, remote } = req.body;
        const result = await pool.query(
            `INSERT INTO jobs (title, company, salary, remote, created_by)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title.trim(), company, salary, remote ?? false, req.user.id]
        );
    sendSuccess(res, result.rows[0], 201);
    } catch (err) {next(err);}
});

jobsRouter.put("/:id", requireAuth, validateId, validateJob, async (req,res,next) => {
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

jobsRouter.delete("/:id", requireAuth, validateId, async (req, res, next) => {
    try {
        const result = await pool.query("DELETE FROM jobs WHERE id = $1 RETURNING *", [req.jobId]);
        if (result.rowCount === 0) return next(createError(404, "Job Not Found"));
        sendSuccess(res, result.rows[0]);
    } catch (err) {next(err); }
});

const users = []; 
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
    const status = err.status || 500;
    if ( status === 500) console.error(err);
    res.status(status).json({
        success:false, 
        data: null,
        error: status === 500 ? "Lỗi server" : err.message,
    });
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));