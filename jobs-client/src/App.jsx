import { useEffect, useState } from "react";

// 🔐 1. Chỉ giữ phần gốc, ghép /jobs hoặc /auth/login khi gọi
const BASE = "http://localhost:3000/api/v1";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  // 🔐 2. State đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    fetch(`${BASE}/jobs`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        setJobs(json.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  // 🔐 3. Đăng nhập: lưu token vào state và localStorage
  async function login() {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error); // "Incorrect email or password"
      return;
    }
    localStorage.setItem("token", json.data.token);
    setToken(json.data.token);
    setPassword("");
    setError("");
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
  }

  // 🔐 4. Gửi kèm token
  async function addJob() {
    const res = await fetch(`${BASE}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });
    const json = await res.json();
    if (!json.success) {
      if (res.status === 401) logout(); // token hết hạn → bắt đăng nhập lại
      setError(json.error);
      return;
    }
    setJobs((prev) => [...prev, json.data]);
    setTitle("");
    setError("");
  }

  return (
    <div>
      <h1>Jobs</h1>

      {/* 🔐 Chưa login → hiện form Login. Đã login → hiện form Thêm job */}
      {!token ? (
        <div>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login}>Đăng nhập</button>
        </div>
      ) : (
        <div>
          <button onClick={logout}>Đăng xuất</button>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <button onClick={addJob}>Thêm</button>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {jobs.map((j) => (
          <li key={j.id}>{j.title}</li>
        ))}
      </ul>
    </div>
  );
}