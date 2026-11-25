import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import JobForm from "../JobForm";

export default function MyJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    async function loadMine() {
        setJobs(await apiFetch("/jobs/mine"));
    }

    useEffect(() => {
        apiFetch("/jobs/mine").then(setJobs).catch((err) => setMessage(err.message));
    }, []);

    async function handleDelete(id) {
        try {
            await apiFetch(`/jobs/${id}`, { method: "DELETE" });
            setJobs(jobs.filter((j) => j.id !== id));
        } catch (err) {
            setMessage(err.message);
        }
    }

    return (
        <div>
            <h2>Job của tôi</h2>
            <JobForm onSaved={loadMine} />
            {message && <p className="message">{message}</p>}
            {jobs.length === 0 && <p>Anh chưa đăng job nào.</p>}
            <ul>
                {jobs.map((job) =>
                    editingId === job.id ? (
                        <li key={job.id}>
                            <JobForm job={job} onSaved={() => { setEditingId(null); loadMine(); }} />
                        </li>
                    ) : (
                        <li key={job.id}>
                            <b>{job.title}</b> · {job.company}
                            <button onClick={() => setEditingId(job.id)}>Sửa</button>
                            <button onClick={() => handleDelete(job.id)}>Xoá</button>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}