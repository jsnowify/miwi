import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F9F4EF" }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 22,
            color: "#C96A3A",
          }}
        >
          miwi
        </span>
      </div>
    );
  }

  // Already logged in — send to feed
  return user ? <Navigate to="/feed" replace /> : children;
}
