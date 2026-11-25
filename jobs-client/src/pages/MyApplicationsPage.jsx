import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function MyApplicationsPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/auth/me/applications").then(setApps).finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Đang tải...</p>;
    if (apps.length === 0) return <p>Anh chưa ứng tuyển job nào.</p>;

    return (
        <div>
            <h2>Đơn của tôi</h2>
            <ul>
                {apps.map((a) => (
                    <li key={a.id}>
                        {a.title} · {a.company} · {a.status} · {new Date(a.created_at).toLocaleDateString("vi-VN")}
                    </li>
                ))}
            </ul>
        </div>
    );
}