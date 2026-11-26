import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoginForm from "./LoginForm";
import RequireAuth from "./RequireAuth";
import JobsPage from "./pages/JobsPage";
import MyJobsPage from "./pages/MyJobsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import NotificationBadge from "./components/NotificationBadge";

export default function App() {
    const { user } = useAuth();
    return (
        <div className="app">
            <nav>
                <Link to="/">Tất cả job</Link>
                {user && <NotificationBadge />}                       
                {user && <Link to="/applications">Đơn của tôi</Link>}
            </nav>
            <LoginForm />
            <Routes>
                <Route path="/" element={<JobsPage />} />
                <Route path="/mine" element={<RequireAuth><MyJobsPage /></RequireAuth>} />
                <Route path="/applications" element={<RequireAuth><MyApplicationsPage /></RequireAuth>} />
            </Routes>
        </div>
    );
}