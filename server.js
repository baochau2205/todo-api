const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); // đọc body JSON

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next(); // bắt buộc, thiếu là request bị treo
});

app.get("/", (req, res) => res.send("Hello API"));

// GET / users/5?role=admin
app.get("/users/:id", (req, res) => {
    const { id } = req.params;
    const { role } = req.query;
    res.json({ id, role });
});

// POST /users + body {"name":"An"}
app.post("/users", (req, res) => {
    const { name } = req.body;
    res.status(201).json({ name });
});

let jobs = [{ id: 1, title: "Frontend Intern" }];

app.get("/jobs", (req, res) => res.json(jobs));

app.post("/jobs", (req, res) => {
    const job = { id: Date.now(), ...req.body };
    jobs.push(job);
    res.status(201).json(job);
});

app.put("/jobs/:id", (req, res) => {
    jobs = jobs.map(j => j.id == req.params.id ? { ...j, ...req.body } : j);
    res.json({ ok: true });
});

app.delete("/jobs/:id", (req, res) => {
    jobs = jobs.filter(j => j.id != req.params.id);
    res.status(204).end();
});

// 404: Không route nào khớp
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// error handler: bắt buộc đủ 4 tham số
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

app.listen(3000, () => console.log("PORT 3000"));