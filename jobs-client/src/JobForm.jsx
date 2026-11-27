import { useState } from "react";
import { apiFetch } from "./api";

export default function JobForm({ job, onSaved }) {
    const isEdit = Boolean(job);
    const [title, setTitle] = useState(job?.title ?? "");
    const [company, setCompany] = useState(job?.company ?? "");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await apiFetch(isEdit ? `/jobs/${job.id}` : "/jobs", {
                method: isEdit ? "PUT" : "POST",
                body: JSON.stringify({ title, company }),
            });
            if (!isEdit) {
                setTitle("");
                setCompany("");
            }
            setError("");
            onSaved?.();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên job" />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Công ty" />
            <button>{isEdit ? "Lưu" : "Đăng job"}</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}