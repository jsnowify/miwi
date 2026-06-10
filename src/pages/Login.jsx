import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/feed");
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/feed` },
    });
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#F9F4EF", color: "#1C1410" }}
      >
        <nav className="max-w-[420px] mx-auto w-full px-6 py-5 flex justify-between items-center">
          <Link
            to="/"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 24,
              color: "#1C1410",
              textDecoration: "none",
            }}
          >
            miwi
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium no-underline"
            style={{ color: "#8A7060" }}
          >
            Sign up
          </Link>
        </nav>

        <div className="max-w-[420px] mx-auto w-full px-6 pt-8 pb-16 flex-1">
          <h1
            className="font-normal mb-2"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(28px, 6vw, 36px)",
            }}
          >
            Welcome back.
          </h1>
          <p
            className="mb-8 text-sm leading-relaxed"
            style={{ color: "#7A6254" }}
          >
            Pick up where you left off with your circle.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "#8A7060" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm border"
                style={{
                  background: "#FFF8F3",
                  borderColor: "#E8D5C4",
                  color: "#1C1410",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "#8A7060" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm border"
                style={{
                  background: "#FFF8F3",
                  borderColor: "#E8D5C4",
                  color: "#1C1410",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#A05A3A" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full font-medium text-base mt-1"
              style={{
                background: "#C96A3A",
                color: "#F9F4EF",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p
            className="text-center text-sm mt-4"
            style={{ color: "#C96A3A", cursor: "pointer" }}
            onClick={async () => {
              if (!email) {
                setError("Enter your email above first.");
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(
                email,
                {
                  redirectTo: `${window.location.origin}/reset-password`,
                },
              );
              if (!error) setError("Check your inbox for a reset link.");
            }}
          >
            Forgot password?
          </p>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
            <span className="text-xs" style={{ color: "#B09A8A" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-3.5 rounded-full font-medium text-base"
            style={{
              background: "#F0E5DB",
              color: "#7A4A2A",
              border: "none",
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color: "#8A7060" }}>
            New here?{" "}
            <Link
              to="/signup"
              style={{ color: "#C96A3A", textDecoration: "none" }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
