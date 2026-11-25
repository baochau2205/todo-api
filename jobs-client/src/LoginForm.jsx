import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function LoginForm() {
    const { user, login, logout } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message);
        }
    }

    if (user) {
        return <p>Hello {user.email} <button onClick={logout}>Logout</button></p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button>Login</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
}