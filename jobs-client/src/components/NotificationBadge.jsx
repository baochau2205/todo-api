import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { socket } from "../socket";

export default function NotificationBadge() {
    const [unread, setUnread] = useState(0);
    const [last, setLast] = useState("");

    useEffect(() => {
        function onApply(data) {
            setUnread((n) => n + 1);
            setLast(`${data.from} vừa ứng tuyển "${data.jobTitle}"`);
        }
        socket.on("application:new", onApply);
        return () => socket.off("application:new", onApply);
    }, []);

    return (
        <span>
            <Link to="/mine" onClick={() => setUnread(0)}>
                Job của tôi {unread > 0 && <b>({unread})</b>}
            </Link>
            {unread > 0 && <small> · {last}</small>}
        </span>
    );
}