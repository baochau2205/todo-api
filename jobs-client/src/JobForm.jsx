import { useState } from "react";
import { apiFetch } from "./api";

export default function JobForm({ onCreated }) {
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await apiFetch("/jobs", { method: "POST", body: JSON.stringify({ title, company }) });
            setTitle(""); setCompany(""); setError("");
            onCreated();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên job" />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Công ty" />
            <button>Đăng job</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}