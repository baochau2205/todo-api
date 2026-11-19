import { useEffect, useState } from "react";

// ★ 1. Gom cả version vào hằng số, sau này đổi v2 chỉ sửa 1 dòng
const API = "http://localhost:3000/api/v1/jobs";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(""); // ★ state hiện lỗi cho người dùng

  // ★ 2. Lấy dữ liệu trong json.data
  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        setJobs(json.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  // ★ 3. Kiểm tra success trước khi thêm vào danh sách
  async function addJob() {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error); // "Title không được trống"
      return;
    }
    setJobs((prev) => [...prev, json.data]);
    setTitle("");
    setError("");
  }

  return (
    <div>
      <h1>Jobs</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onClick={addJob}>Thêm</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {jobs.map((j) => (
          <li key={j.id}>{j.title}</li>
        ))}
      </ul>
    </div>
  );
}