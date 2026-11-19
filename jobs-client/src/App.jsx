import { useEffect, useState } from "react";

const API = "http://localhost:3000";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch(`${API}/jobs`)
      .then((r) => r.json())
      .then(setJobs);
  }, []);

  async function addJob() {
    const res = await fetch(`${API}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const job = await res.json();
    setJobs([...jobs, job]);
    setTitle("");
  }

  return (
    <div>
      <h1>Jobs</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onClick={addJob}>Thêm</button>
      <ul>
        {jobs.map((j) => (
          <li key={j.id}>{j.title}</li>
        ))}
      </ul>
    </div>
  );
}