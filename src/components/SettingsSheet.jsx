import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function SettingsSheet({ onClose }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleLogout() {
    // 1. Clear ALL React Query cache so no stale data leaks to next user
    queryClient.clear();
    // 2. Sign out from Supabase (clears session cookie/localStorage)
    await supabase.auth.signOut();
    // 3. Send to landing page
    navigate("/", { replace: true });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(28,20,16,0.4)",
          zIndex: 100,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "#FDFAF7",
          borderRadius: "24px 24px 0 0",
          zIndex: 101,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            background: "#E8D5C4",
            margin: "12px auto 0",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #EDE3DA",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 20,
              color: "#1C1410",
            }}
          >
            Settings
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "#F0E5DB",
              color: "#8A7060",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="#8A7060"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Settings rows */}
        <div style={{ padding: "8px 0" }}>
          {/* Account section */}
          <div
            style={{
              padding: "8px 24px 4px",
              fontSize: 11,
              fontWeight: 600,
              color: "#B09A8A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Account
          </div>

          {[
            { icon: "ti-user", label: "Edit profile" },
            { icon: "ti-bell", label: "Notifications" },
            { icon: "ti-lock", label: "Privacy" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 24px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F5EDE3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#F0E5DB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`ti ${icon}`}
                  style={{ fontSize: 18, color: "#C96A3A" }}
                />
              </div>
              <span style={{ fontSize: 14, color: "#1C1410", fontWeight: 500 }}>
                {label}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginLeft: "auto", flexShrink: 0 }}
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="#C0A898"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}

          {/* App section */}
          <div
            style={{
              padding: "12px 24px 4px",
              fontSize: 11,
              fontWeight: 600,
              color: "#B09A8A",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            App
          </div>

          {[
            { icon: "ti-help", label: "Help & feedback" },
            { icon: "ti-info-circle", label: "About Miwi" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 24px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F5EDE3")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#F0E5DB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`ti ${icon}`}
                  style={{ fontSize: 18, color: "#C96A3A" }}
                />
              </div>
              <span style={{ fontSize: 14, color: "#1C1410", fontWeight: 500 }}>
                {label}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ marginLeft: "auto", flexShrink: 0 }}
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="#C0A898"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}

          {/* Danger zone */}
          <div
            style={{ margin: "12px 24px 0", borderTop: "1px solid #EDE3DA" }}
          />

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 24px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
              textAlign: "left",
              marginBottom: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF0ED")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#FFE8E3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i
                className="ti ti-logout"
                style={{ fontSize: 18, color: "#D94F2A" }}
              />
            </div>
            <span style={{ fontSize: 14, color: "#D94F2A", fontWeight: 600 }}>
              Log out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
