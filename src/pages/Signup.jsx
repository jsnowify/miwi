import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
  });
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const usernameDebounce = useRef(null);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

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
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      setUsernameStatus(data ? "taken" : "available");
    }, 500);

    return () => clearTimeout(usernameDebounce.current);
  }, [form.username]);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (usernameStatus !== "available") return;

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.displayName,
          username: form.username,
        },
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
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#F9F4EF", color: "#1C1410" }}
      >
        {/* Nav */}
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
            to="/login"
            className="text-sm font-medium no-underline"
            style={{ color: "#8A7060" }}
          >
            Log in
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
            Join your circle.
          </h1>
          <p
            className="mb-8 text-sm leading-relaxed"
            style={{ color: "#7A6254" }}
          >
            It's free, private, and yours.
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {/* Display name */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "#8A7060" }}
              >
                Display name
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={set("displayName")}
                placeholder="sofía"
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

            {/* Username — live validation */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "#8A7060" }}
              >
                Username
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={form.username}
                  onChange={set("username")}
                  placeholder="sofi"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm border"
                  style={{
                    background: "#FFF8F3",
                    borderColor:
                      usernameStatus === "available"
                        ? "#6BAE8A"
                        : usernameStatus === "taken" ||
                            usernameStatus === "invalid"
                          ? "#C96A3A"
                          : "#E8D5C4",
                    color: "#1C1410",
                    outline: "none",
                    paddingRight: "2.5rem",
                    transition: "border-color 0.2s",
                  }}
                />
                {usernameStatus && (
                  <span
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {usernameStatus === "checking" && (
                      <span
                        style={{
                          color: "#B09A8A",
                          fontSize: "13px",
                          letterSpacing: "0.05em",
                        }}
                      >
                        ···
                      </span>
                    )}
                    {usernameStatus === "available" && (
                      <i
                        className="ti ti-circle-check-filled"
                        style={{ color: "#6BAE8A", fontSize: "18px" }}
                      />
                    )}
                    {(usernameStatus === "taken" ||
                      usernameStatus === "invalid") && (
                      <i
                        className="ti ti-circle-x-filled"
                        style={{ color: "#C96A3A", fontSize: "18px" }}
                      />
                    )}
                  </span>
                )}
              </div>
              {usernameStatus === "available" && (
                <p className="text-xs mt-1.5" style={{ color: "#6BAE8A" }}>
                  @{form.username} is available!
                </p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-xs mt-1.5" style={{ color: "#A05A3A" }}>
                  @{form.username} is already taken.
                </p>
              )}
              {usernameStatus === "invalid" && (
                <p className="text-xs mt-1.5" style={{ color: "#A05A3A" }}>
                  3–30 characters: lowercase letters, numbers, or underscores
                  only.
                </p>
              )}
              {usernameStatus === "checking" && (
                <p className="text-xs mt-1.5" style={{ color: "#B09A8A" }}>
                  Checking availability…
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "#8A7060" }}
              >
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
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

            {/* Password */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "#8A7060" }}
              >
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="8+ characters"
                required
                minLength={8}
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
              <p
                className="text-sm"
                style={{
                  color: error.startsWith("Almost") ? "#7A6254" : "#A05A3A",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || usernameStatus !== "available"}
              className="w-full py-3.5 rounded-full font-medium text-base mt-1"
              style={{
                background:
                  usernameStatus === "available" ? "#C96A3A" : "#E8D5C4",
                color: usernameStatus === "available" ? "#F9F4EF" : "#B09A8A",
                border: "none",
                cursor:
                  loading || usernameStatus !== "available"
                    ? "not-allowed"
                    : "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {loading ? "Creating account…" : "Create account 🌸"}
            </button>
          </form>

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

          <p
            className="text-center text-xs mt-5 leading-relaxed"
            style={{ color: "#B09A8A" }}
          >
            By signing up you agree to our{" "}
            <span style={{ color: "#C96A3A", cursor: "pointer" }}>Terms</span>{" "}
            &amp;{" "}
            <span style={{ color: "#C96A3A", cursor: "pointer" }}>
              Privacy Policy
            </span>
            .
          </p>
          <p className="text-center text-sm mt-4" style={{ color: "#8A7060" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "#C96A3A", textDecoration: "none" }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
