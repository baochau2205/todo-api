import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "./api";
import { socket } from "./socket";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

    useEffect(() => {
        if (!localStorage.getItem("token")) return;
        apiFetch("/auth/me")
            .then(setUser)
            .catch(() => localStorage.removeItem("token"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        socket.auth = { token: localStorage.getItem("token") };
        socket.disconnect().connect();
        return () => socket.disconnect();
    }, [user]);

    async function login(email, password) {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        localStorage.setItem("token", data.token);
        setUser(await apiFetch("/auth/me"));
    }

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}