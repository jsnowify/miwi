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

function Field({ label, children }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1 uppercase tracking-widest"
        style={{ color: "#8A7060" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
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

  function inputStyle(name) {
    return focused === name ? focusInput : baseInput;
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="h-screen flex flex-col relative overflow-hidden"
        style={{ background: "#F9F4EF", color: "#1C1410" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, #F0E5DB 0%, transparent 70%)",
          }}
        />

        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-105 mx-auto py-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6 w-full">
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 56,
                lineHeight: 1,
                marginBottom: 14,
              }}
            >
              miwi
            </span>
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 24,
                lineHeight: 1.2,
                marginBottom: 10,
              }}
            >
              A soft space for the people who matter.
            </h1>
            <p style={{ fontSize: 14, color: "#7A6254", lineHeight: 1.5 }}>
              miwi is a private app for sharing feelings with the people you
              trust, helping you feel seen, understood, and connected every day.
            </p>
          </div>

          {/* Form */}
          <div className="w-full">
            <button
              onClick={handleGoogle}
              className="w-full py-3 rounded-full font-medium text-base flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
              style={{
                background: "#fff",
                color: "#1C1410",
                border: "1.5px solid #E8D5C4",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(140,90,60,0.04)",
              }}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                width={18}
                height={18}
                alt="Google logo"
              />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
              <span className="text-xs" style={{ color: "#B09A8A" }}>
                or log in with email
              </span>
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
            </div>

            <form className="flex flex-col gap-3" onSubmit={handleLogin}>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm border"
                  style={inputStyle("email")}
                />
              </Field>

              <Field label="Password">
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm border"
                    style={{
                      ...inputStyle("password"),
                      paddingRight: "2.5rem",
                    }}
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
              </Field>

              {error && (
                <p className="text-sm" style={{ color: "#A05A3A" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full font-medium text-base mt-1 transition-transform active:scale-[0.98]"
                style={{
                  background: "#C96A3A",
                  color: "#F9F4EF",
                  border: "none",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(201,106,58,0.2)",
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
                  { redirectTo: `${window.location.origin}/reset-password` },
                );
                if (!error) setError("Check your inbox for a reset link.");
              }}
            >
              Forgot password?
            </p>

            <p
              className="text-center text-sm mt-4"
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

        <footer
          className="w-full py-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[12px] relative z-10 border-t"
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
