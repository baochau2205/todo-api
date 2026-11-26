import { useState } from 'react';
import { apiFetch } from '../api';

function ApplyButton({ jobId }) {
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');

    async function handleApply(e) {
        e.preventDefault();
        const form = new FormData();
        if (file) form.append('cv', file);
        try {
            await apiFetch(`/jobs/${jobId}/apply`, { method: 'POST', body: form });
            setMsg('Đã ứng tuyển!');
        } catch (err) {
            setMsg(err.message);
        }
    }

    return (
        <form onSubmit={handleApply}>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
            {file && <p>{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
            <button>Ứng tuyển</button>
            {msg && <p>{msg}</p>}
        </form>
    );
}

export default ApplyButton;