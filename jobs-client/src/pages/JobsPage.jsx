import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../AuthContext";
import { socket } from "../socket";
import ApplyButton from "../components/ApplyButton";

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

    // Buổi 22: nghe job mới / job bị xoá
    useEffect(() => {
        function onCreated(job) {
            setJobs((prev) => (prev.some((j) => j.id === job.id) ? prev : [...prev, job]));
        }
        function onDeleted({ id }) {
            setJobs((prev) => prev.filter((j) => j.id !== id));
        }
        socket.on("job:created", onCreated);
        socket.on("job:deleted", onDeleted);
        return () => {
            socket.off("job:created", onCreated);
            socket.off("job:deleted", onDeleted);
        };
    }, []);

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
                        {user && user.id !== job.created_by && <ApplyButton jobId={job.id} />}
                    </li>
                ))}
            </ul>
        </div>
    );
}