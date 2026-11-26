const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    const isForm = options.body instanceof FormData;
    const headers = {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,                 // ← chỗ này thay cho cả khối headers: { ... } cũ
    });

    const json = await res.json();
    if (!json.success) {
        const err = new Error(json.error);
        err.status = res.status;
        throw err;
    }
    return json.data;
}