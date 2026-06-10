import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LandingPage() {
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
        className="min-h-screen flex flex-col relative"
        style={{ background: "#F9F4EF", color: "#1C1410" }}
      >
        {/* Subtle background decoration */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, #F0E5DB 0%, transparent 70%)",
          }}
        />

        {/* Main centered container */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-[420px] mx-auto py-12">
          {/* Logo & Description */}
          <div className="flex flex-col items-center text-center mb-10 w-full">
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 64,
                color: "#1C1410",
                lineHeight: 1,
                marginBottom: 24,
              }}
            >
              miwi
            </span>
            <h1
              className="font-normal leading-[1.2] m-0 mb-4"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 28,
                color: "#1C1410",
              }}
            >
              A soft space for the people who matter.
            </h1>
            <p
              className="m-0 leading-[1.6]"
              style={{
                fontSize: 15,
                color: "#7A6254",
              }}
            >
              Miwi is a private app for sharing feelings with the people you
              trust, helping you feel seen, understood, and connected every day.
            </p>
          </div>

          {/* Form Area */}
          <div className="w-full">
            {/* Google Continue */}
            <button
              onClick={handleGoogle}
              className="w-full py-3.5 rounded-full font-medium text-base flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
              style={{
                background: "#fff",
                color: "#1C1410",
                border: "1.5px solid #E8D5C4",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(140, 90, 60, 0.04)",
              }}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                width={20}
                height={20}
                alt="Google logo"
              />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
              <span className="text-xs" style={{ color: "#B09A8A" }}>
                or log in with email
              </span>
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
            </div>

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
                className="w-full py-3.5 rounded-full font-medium text-base mt-2 transition-transform active:scale-[0.98]"
                style={{
                  background: "#C96A3A",
                  color: "#F9F4EF",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(201, 106, 58, 0.2)",
                }}
              >
                {loading ? "Signing in…" : "Log in"}
              </button>
            </form>

            <p
              className="text-center text-sm mt-5"
              style={{ color: "#C96A3A", cursor: "pointer" }}
              onClick={async () => {
                if (!email) {
                  setError("Enter your email above first.");
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(
                  email,
                  { redirectTo: `${window.location.origin}/reset-password` },
                );
                if (!error) setError("Check your inbox for a reset link.");
              }}
            >
              Forgot password?
            </p>

            <p
              className="text-center text-sm mt-6"
              style={{ color: "#8A7060" }}
            >
              New here?{" "}
              <Link
                to="/signup"
                className="font-semibold"
                style={{ color: "#C96A3A", textDecoration: "none" }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer
          className="w-full py-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] relative z-10 border-t"
          style={{ borderColor: "#EDE3DA" }}
        >
          <span style={{ color: "#B09A8A" }}>© 2026 miwi</span>
          <Link
            to="/privacy"
            style={{ color: "#B09A8A", textDecoration: "none" }}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            style={{ color: "#B09A8A", textDecoration: "none" }}
          >
            Terms of Service
          </Link>
        </footer>
      </div>
    </>
  );
}
