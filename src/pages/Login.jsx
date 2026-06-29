import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const EyeIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const baseInput = {
  background: "#FFF8F3",
  borderColor: "#E8D5C4",
  color: "#1C1410",
  outline: "none",
  transition: "border-color 0.15s",
};

const focusInput = {
  ...baseInput,
  borderColor: "#1C1410",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function inputStyle(name) {
    return focused === name ? focusInput : baseInput;
  }

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
        className="min-h-screen flex flex-col items-center justify-between px-6"
        style={{ background: "#F9F4EF", color: "#1C1410" }}
      >
        <div />

        <div className="flex flex-col items-center w-full max-w-[360px] gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 72,
                lineHeight: 1,
                color: "#1C1410",
              }}
            >
              miwi
            </span>
            <p
              style={{
                fontSize: 15,
                color: "#A08070",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              small circle. big feelings.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98]"
              style={{
                background: "#fff",
                color: "#1C1410",
                border: "1.5px solid #E8D5C4",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(140,90,60,0.08)",
              }}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                width={18}
                height={18}
                alt="Google"
              />
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
              <span className="text-[11px]" style={{ color: "#B09A8A" }}>
                or
              </span>
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-2xl text-sm border"
                style={inputStyle("email")}
              />

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm border"
                  style={{ ...inputStyle("password"), paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#B09A8A",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>

              {error && (
                <p
                  className="text-xs px-1"
                  style={{
                    color: error.startsWith("Check") ? "#7A9A7A" : "#A05A3A",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl font-medium text-sm transition-transform active:scale-[0.98]"
                style={{
                  background: "#C96A3A",
                  color: "#F9F4EF",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(201,106,58,0.25)",
                }}
              >
                {loading ? "Signing in…" : "Log in"}
              </button>

              <p
                className="text-center text-xs cursor-pointer"
                style={{ color: "#C96A3A" }}
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
            </form>
          </div>

          <p className="text-sm text-center" style={{ color: "#8A7060" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#C96A3A",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </p>
        </div>

        <footer
          className="flex gap-5 py-8 text-[11px]"
          style={{ color: "#C0A898" }}
        >
          <span>© 2026 miwi</span>
          <Link
            to="/privacy"
            style={{ color: "#C0A898", textDecoration: "none" }}
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            style={{ color: "#C0A898", textDecoration: "none" }}
          >
            Terms
          </Link>
        </footer>
      </div>
    </>
  );
}
