import { useState, useEffect, useContext, useRef, Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return scrolled;
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location          = useLocation();
  const navigate          = useNavigate();
  const scrolled          = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef   = useRef(null);
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate("/"); };

  const avatarLetter =
    user?.username?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  /* ── hamburger icon lines (avoids <> in ternary parse error) ── */
  const CloseLines = (
    <Fragment>
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </Fragment>
  );
  const BurgerLines = (
    <Fragment>
      <line x1="3"  y1="6"  x2="21" y2="6"  />
      <line x1="3"  y1="12" x2="21" y2="12" />
      <line x1="3"  y1="18" x2="21" y2="18" />
    </Fragment>
  );

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        transition: "all 0.3s ease",
        background:    scrolled ? "rgba(7,11,20,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        borderBottom:  scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        boxShadow:     scrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <nav
        style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "0 24px", height: "64px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "24px",
        }}
      >
        {/* ── LEFT: Logo only ── */}
        <Link
          to="/"
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            textDecoration: "none", flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "15px",
              boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #60a5fa, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TaskFlow
          </span>
        </Link>

        {/* ── CENTER: Nav links or page label ── */}
        <div
          className="hidden-mobile"
          style={{
            flex: 1, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {isLanding && !user && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
             {[
  ["#features", "Features"],
  ["#how-it-works", "How it works"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
].map(([href, label]) => (
  <a
    key={href}
    href={href}
    onClick={(e) => {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }}
    style={{
      padding: "7px 14px",
      borderRadius: "99px",
      fontSize: "13px",
      fontWeight: 500,
      color: "rgba(255,255,255,0.55)",
      textDecoration: "none",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "#fff";
      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "rgba(255,255,255,0.55)";
      e.currentTarget.style.background = "transparent";
    }}
  >
    {label}
  </a>
))}
            </div>
          )}

          {user && !isLanding && (
            <span
              style={{
                fontSize: "14px", fontWeight: 600,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.01em",
              }}
            >
              Dashboard
            </span>
          )}
        </div>

        {/* ── RIGHT: Auth actions ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {!user ? (
            <Fragment>
              <Link to="/login" className="btn-ghost hidden-mobile" style={{ textDecoration: "none" }}>
                Log in
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ textDecoration: "none", fontSize: "13px", padding: "8px 18px" }}
              >
                Get started
              </Link>
            </Fragment>
          ) : (
            <Fragment>
              {/* Notifications */}
              <button
                className="btn-ghost"
                style={{ padding: "8px", borderRadius: "50%", position: "relative" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span
                  style={{
                    position: "absolute", top: "6px", right: "6px",
                    width: "6px", height: "6px",
                    background: "#f43f5e", borderRadius: "50%",
                    border: "2px solid var(--bg-primary)",
                  }}
                />
              </button>

              {/* User dropdown */}
              <div ref={dropRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropOpen((o) => !o)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "5px 12px 5px 5px",
                    background: dropOpen
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "99px",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: "12px", color: "#fff",
                    }}
                  >
                    {avatarLetter}
                  </div>
                  <span
                    style={{
                      fontSize: "13px", fontWeight: 600,
                      color: "rgba(255,255,255,0.9)",
                      maxWidth: "100px", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {user?.username || user?.email?.split("@")[0]}
                  </span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"
                    style={{
                      transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropOpen && (
                  <div
                    className="animate-scale-in"
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      width: "200px", borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                      zIndex: 300,
                      background: "rgba(15,22,40,0.97)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {/* Dropdown header */}
                    <div
                      style={{
                        padding: "12px 16px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                        {user?.username || "User"}
                      </p>
                      <p
                        style={{
                          fontSize: "11px", color: "rgba(255,255,255,0.4)",
                          margin: "2px 0 0", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {user?.email}
                      </p>
                    </div>

                    {/* Dropdown links */}
                    <div style={{ padding: "6px" }}>
                      {[
                        { label: "Dashboard", to: "/dashboard", icon: "⊞" },
                        { label: "Settings",  to: "/settings",  icon: "⚙" },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "9px 12px", borderRadius: "10px",
                            fontSize: "13px", fontWeight: 500,
                            color: "rgba(255,255,255,0.6)",
                            textDecoration: "none", transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          width: "100%", padding: "9px 12px", borderRadius: "10px",
                          fontSize: "13px", fontWeight: 500, color: "#f43f5e",
                          background: "none", border: "none",
                          cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{ fontSize: "14px" }}>↩</span>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          )}

          {/* Hamburger */}
          <button
            className="show-mobile btn-ghost"
            style={{ padding: "8px" }}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? CloseLines : BurgerLines}
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(7,11,20,0.95)",
            backdropFilter: "blur(24px)",
          }}
        >
          {isLanding && !user && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
              {[
  ["#features", "Features"],
  ["#how-it-works", "How it works"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
].map(([href, label]) => (
  <a
    key={href}
    href={href}
    onClick={() => setMenuOpen(false)}
    style={{
      padding: "10px 14px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: 500,
      color: "rgba(255,255,255,0.6)",
      textDecoration: "none",
    }}
  >
    {label}
  </a>
))}
            </div>
          )}
          {!user && (
            <div style={{ display: "flex", gap: "8px" }}>
              <Link to="/login"    className="btn-secondary" style={{ flex: 1, textDecoration: "none", justifyContent: "center" }}>Log in</Link>
              <Link to="/register" className="btn-primary"   style={{ flex: 1, textDecoration: "none", justifyContent: "center" }}>Sign up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}