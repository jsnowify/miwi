import { useState, useEffect, useRef } from "react";
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

const CheckIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6BAE8A"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#C96A3A"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function StatusIcon({ status }) {
  if (status === "checking")
    return (
      <span style={{ color: "#B09A8A", fontSize: 12, letterSpacing: "0.1em" }}>
        ···
      </span>
    );
  if (status === "available") return <CheckIcon />;
  if (status === "taken" || status === "invalid") return <XIcon />;
  return null;
}

export default function Signup() {
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
  });
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const usernameDebounce = useRef(null);
  const emailDebounce = useRef(null);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function inputStyle(name, validationStatus) {
    const borderColor =
      validationStatus === "available"
        ? "#6BAE8A"
        : validationStatus === "taken" || validationStatus === "invalid"
          ? "#C96A3A"
          : focused === name
            ? "#1C1410"
            : "#E8D5C4";

    return {
      background: "#FFF8F3",
      borderColor,
      color: "#1C1410",
      outline: "none",
      paddingRight: "2.5rem",
      transition: "border-color 0.15s",
    };
  }

  function plainInputStyle(name) {
    return {
      background: "#FFF8F3",
      borderColor: focused === name ? "#1C1410" : "#E8D5C4",
      color: "#1C1410",
      outline: "none",
      transition: "border-color 0.15s",
    };
  }

  // Username live check — uses RPC (SECURITY DEFINER) so RLS on the
  // profiles table doesn't hide usernames belonging to people outside
  // the signing-up user's circles.
  useEffect(() => {
    const username = form.username;
    if (!username) {
      setUsernameStatus(null);
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    clearTimeout(usernameDebounce.current);

    usernameDebounce.current = setTimeout(async () => {
      const { data: exists, error: rpcError } = await supabase.rpc(
        "check_username_exists",
        { p_username: username },
      );
      if (rpcError) {
        setUsernameStatus(null);
        return;
      }
      setUsernameStatus(exists ? "taken" : "available");
    }, 500);

    return () => clearTimeout(usernameDebounce.current);
  }, [form.username]);

  // Email live check
  useEffect(() => {
    const email = form.email;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus("checking");
    clearTimeout(emailDebounce.current);

    emailDebounce.current = setTimeout(async () => {
      const { data: exists } = await supabase.rpc("check_email_exists", {
        p_email: email,
      });
      setEmailStatus(exists ? "taken" : "available");
    }, 600);

    return () => clearTimeout(emailDebounce.current);
  }, [form.email]);

  const canSubmit =
    usernameStatus === "available" && emailStatus === "available" && !loading;

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.displayName, username: form.username },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      navigate("/feed");
    } else {
      setError(
        "Almost there! Check your email to confirm your account, then log in.",
      );
      setLoading(false);
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
        className="h-screen flex flex-col overflow-hidden"
        style={{ background: "#F9F4EF", color: "#1C1410" }}
      >
        {/* NAV */}
        <nav className="max-w-[420px] mx-auto w-full px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 22,
              color: "#1C1410",
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            miwi
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium no-underline"
            style={{ color: "#8A7060" }}
          >
            Log in
          </Link>
        </nav>

        {/* MAIN */}
        <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
          <div className="w-full max-w-[420px] py-4">
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(26px, 5vw, 34px)",
                marginBottom: 4,
                lineHeight: 1.2,
              }}
            >
              Join your circle.
            </h1>
            <p
              className="mb-5 text-sm"
              style={{ color: "#7A6254", lineHeight: 1.5 }}
            >
              It's free, private, and yours.
            </p>

            {/* GOOGLE */}
            <button
              onClick={handleGoogle}
              className="w-full py-3 rounded-full font-medium text-sm flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
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
                alt=""
              />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
              <span className="text-xs" style={{ color: "#B09A8A" }}>
                or sign up with email
              </span>
              <div className="flex-1 h-px" style={{ background: "#EDE3DA" }} />
            </div>

            <form className="flex flex-col gap-3" onSubmit={handleSignup}>
              {/* Display name */}
              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-widest"
                  style={{ color: "#8A7060" }}
                >
                  Display name
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={set("displayName")}
                  onFocus={() => setFocused("displayName")}
                  onBlur={() => setFocused(null)}
                  placeholder="miwi"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm border"
                  style={plainInputStyle("displayName")}
                />
              </div>

              {/* Username */}
              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-widest"
                  style={{ color: "#8A7060" }}
                >
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={form.username}
                    onChange={set("username")}
                    onFocus={() => setFocused("username")}
                    onBlur={() => setFocused(null)}
                    placeholder="miwi"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm border"
                    style={inputStyle("username", usernameStatus)}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <StatusIcon status={usernameStatus} />
                  </span>
                </div>
                {usernameStatus === "available" && (
                  <p className="text-xs mt-1" style={{ color: "#6BAE8A" }}>
                    @{form.username} is available!
                  </p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-xs mt-1" style={{ color: "#A05A3A" }}>
                    @{form.username} is already taken.
                  </p>
                )}
                {usernameStatus === "invalid" && (
                  <p className="text-xs mt-1" style={{ color: "#A05A3A" }}>
                    3–30 characters: lowercase letters, numbers, or underscores
                    only.
                  </p>
                )}
                {usernameStatus === "checking" && (
                  <p className="text-xs mt-1" style={{ color: "#B09A8A" }}>
                    Checking availability…
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-widest"
                  style={{ color: "#8A7060" }}
                >
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm border"
                    style={inputStyle("email", emailStatus)}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <StatusIcon status={emailStatus} />
                  </span>
                </div>
                {emailStatus === "available" && (
                  <p className="text-xs mt-1" style={{ color: "#6BAE8A" }}>
                    Looks good!
                  </p>
                )}
                {emailStatus === "taken" && (
                  <p className="text-xs mt-1" style={{ color: "#A05A3A" }}>
                    An account with this email already exists.{" "}
                    <Link
                      to="/login"
                      style={{
                        color: "#C96A3A",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Log in?
                    </Link>
                  </p>
                )}
                {emailStatus === "checking" && (
                  <p className="text-xs mt-1" style={{ color: "#B09A8A" }}>
                    Checking…
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-medium mb-1 uppercase tracking-widest"
                  style={{ color: "#8A7060" }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="8+ characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 rounded-xl text-sm border"
                    style={{
                      ...plainInputStyle("password"),
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

              {error && (
                <p
                  className="text-xs"
                  style={{
                    color: error.startsWith("Almost") ? "#7A6254" : "#A05A3A",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3 rounded-full font-medium text-sm mt-1 transition-transform active:scale-[0.98]"
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
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p
              className="text-center text-xs mt-4"
              style={{ color: "#B09A8A" }}
            >
              By signing up you agree to our{" "}
              <span style={{ color: "#C96A3A", cursor: "pointer" }}>Terms</span>{" "}
              &{" "}
              <span style={{ color: "#C96A3A", cursor: "pointer" }}>
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
