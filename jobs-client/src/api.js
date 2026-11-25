const API_URL = import.meta.env.VITE_API_URL;
export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token&& { Authorization: `Bearer ${token}` }),
        },
    });
const json = await res.json();
if (!json.success) {
    const err = new Error(json.error);
    err.status = res.status;
    throw err;
}
return json.data;
}