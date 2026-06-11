import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // token is valid, stay on this page
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  function inputStyle(name) {
    return {
      background: "#FFF8F3",
      borderColor: focused === name ? "#1C1410" : "#E8D5C4",
      color: "#1C1410",
      outline: "none",
      transition: "border-color 0.15s",
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // ✅ Sign out immediately — reset flow should not create a session
    await supabase.auth.signOut();

    setDone(true);
    setTimeout(() => navigate("/login", { replace: true }), 2500);
  }

  const canSubmit = !loading && password === confirm && password.length >= 8;

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
              {done ? "password updated 🌿" : "set a new password"}
            </p>
          </div>

          {done ? (
            /* ── Success state — clean, no ugly icons ── */
            <div
              style={{
                width: "100%",
                padding: "28px 24px",
                borderRadius: 20,
                background: "#F0E5DB",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 20,
                  color: "#1C1410",
                }}
              >
                all done
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#7A6254",
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                your password has been updated.
                <br />
                taking you to login…
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 w-full"
            >
              {/* New password */}
              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-widest"
                  style={{ color: "#8A7060" }}
                >
                  New password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="8+ characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-2xl text-sm border"
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
              </div>

              {/* Confirm password */}
              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-widest"
                  style={{ color: "#8A7060" }}
                >
                  Confirm password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={() => setFocused("confirm")}
                    onBlur={() => setFocused(null)}
                    placeholder="repeat your password"
                    required
                    className="w-full px-4 py-3 rounded-2xl text-sm border"
                    style={{ ...inputStyle("confirm"), paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
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

                {/* Live match indicator — text only, no icons */}
                {confirm.length > 0 && (
                  <p
                    className="text-xs mt-1"
                    style={{
                      color: password === confirm ? "#6BAE8A" : "#A05A3A",
                    }}
                  >
                    {password === confirm
                      ? "passwords match"
                      : "passwords don't match yet"}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#A05A3A" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3 rounded-2xl font-medium text-sm mt-1 transition-transform active:scale-[0.98]"
                style={{
                  background: canSubmit ? "#C96A3A" : "#E8D5C4",
                  color: canSubmit ? "#F9F4EF" : "#B09A8A",
                  border: "none",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "background 0.2s, color 0.2s",
                  boxShadow: canSubmit
                    ? "0 4px 12px rgba(201,106,58,0.25)"
                    : "none",
                }}
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>

        <footer
          className="flex gap-5 py-8 text-[11px]"
          style={{ color: "#C0A898" }}
        >
          <span>© 2026 miwi</span>
        </footer>
      </div>
    </>
  );
}
