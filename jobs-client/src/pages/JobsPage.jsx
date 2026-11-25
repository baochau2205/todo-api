import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../AuthContext";

export default function JobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/jobs")
            .then(setJobs)
            .catch((err) => setMessage(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleApply(id) {
        try {
            await apiFetch(`/jobs/${id}/apply`, { method: "POST" });
            setMessage("Đã ứng tuyển");
        } catch (err) {
            setMessage(err.message);
        }
    }

    if (loading) return <p>Đang tải job...</p>;

    return (
        <div>
            <h2>Tất cả job</h2>
            {message && <p className="message">{message}</p>}
            {jobs.length === 0 && <p>Chưa có job nào.</p>}
            <ul>
                {jobs.map((job) => (
                    <li key={job.id}>
                        <b>{job.title}</b> · {job.company} · đăng bởi {job.posted_by ?? "ẩn danh"}
                        {user && user.id !== job.created_by && (
                            <button onClick={() => handleApply(job.id)}>Ứng tuyển</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}