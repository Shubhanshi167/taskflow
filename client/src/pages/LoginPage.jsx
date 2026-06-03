import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

/* ─── CSS injected once ─────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes tf-spin     { to { transform: rotate(360deg); } }
  @keyframes tf-drift1   { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(18px,-28px) scale(1.06); } }
  @keyframes tf-drift2   { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(-14px,22px) scale(1.04); } }
  @keyframes tf-drift3   { 0%,100%{ transform:translate(0,0) scale(1); } 50%{ transform:translate(10px,-18px) scale(1.08); } }
  @keyframes tf-fade-up  { from{ opacity:0; transform:translateY(20px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes tf-fade-in  { from{ opacity:0; } to{ opacity:1; } }
  @keyframes tf-slide-in { from{ opacity:0; transform:translateX(30px) scale(0.97); } to{ opacity:1; transform:translateX(0) scale(1); } }
  @keyframes tf-slide-err{ from{ opacity:0; transform:translateY(-8px) scale(0.97); } to{ opacity:1; transform:translateY(0) scale(1); } }
  @keyframes tf-pulse-dot { 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }

  .tf-root {
    min-height: 100vh;
    background: #060914;
    display: flex;
    overflow: hidden;
    position: relative;
    font-family: 'DM Sans', 'Inter', sans-serif;
  }

  /* noise */
  .tf-noise {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0.025; pointer-events: none; z-index: 10;
  }

  /* grid */
  .tf-grid {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(139,92,246,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,92,246,0.045) 1px, transparent 1px);
    background-size: 48px 48px;
    -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent);
    mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent);
  }

  /* orbs */
  .tf-orb {
    position: absolute; border-radius: 999px;
    filter: blur(90px); pointer-events: none;
  }
  .tf-orb1 { width:520px;height:520px;background:rgba(109,40,217,0.14);top:-140px;left:-80px; animation:tf-drift1 16s ease-in-out infinite; }
  .tf-orb2 { width:420px;height:420px;background:rgba(37,99,235,0.10); bottom:-120px;right:320px; animation:tf-drift2 19s ease-in-out infinite; }
  .tf-orb3 { width:300px;height:300px;background:rgba(16,185,129,0.06);top:40%;right:15%; animation:tf-drift3 14s ease-in-out infinite; }

  /* left panel */
  .tf-left {
  flex: 1;
  padding: 80px 40px 80px 80px;
    display: flex; flex-direction: column; justify-content: center;
    position: relative; z-index: 2;
    animation: tf-fade-up 0.7s ease both;
  }

  /* logo */
  .tf-logo-link { display:inline-flex;align-items:center;gap:13px;text-decoration:none;margin-bottom:56px; }
  .tf-logo-icon {
    width:48px;height:48px;border-radius:14px;
    background:linear-gradient(135deg,#7c3aed,#2563eb);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 32px rgba(124,58,237,0.4),inset 0 1px 0 rgba(255,255,255,0.15);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .tf-logo-icon:hover { transform:scale(1.08) rotate(-4deg); box-shadow:0 12px 40px rgba(124,58,237,0.55); }
  .tf-logo-name { font-size:20px;font-weight:800;color:white;letter-spacing:-0.03em;line-height:1.1; }
  .tf-logo-sub  { color:#475569;font-size:12px;letter-spacing:0.02em; }

  /* badge */
  .tf-badge {
    display:inline-flex;align-items:center;gap:8px;
    padding:5px 14px;border-radius:999px;
    background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);
    color:#a78bfa;font-size:12px;font-weight:600;
    letter-spacing:0.06em;text-transform:uppercase;margin-bottom:22px;
  }
  .tf-badge-dot {
    width:6px;height:6px;border-radius:999px;background:#a78bfa;display:inline-block;
    animation: tf-pulse-dot 2s ease-in-out infinite;
  }

  /* heading */
  .tf-h1 {
    font-size:68px;line-height:0.94;font-weight:900;color:white;
    letter-spacing:-0.055em;max-width:520px;margin-bottom:24px;
  }
  .tf-gradient-text {
    background:linear-gradient(120deg,#a78bfa 0%,#60a5fa 50%,#34d399 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }
  .tf-subtext { font-size:17px;line-height:1.75;color:#64748b;max-width:500px;margin-bottom:44px; }

  /* features */
  .tf-features { display:flex;flex-direction:column;gap:16px; }
  .tf-feature {
    display:flex;align-items:center;gap:12px;color:#94a3b8;font-size:15px;font-weight:500;cursor:default;
    transition:transform 0.2s ease;
  }
  .tf-feature:hover { transform:translateX(6px); }
  .tf-feature-icon {
    width:32px;height:32px;border-radius:10px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(139,92,246,0.22),rgba(59,130,246,0.16));
    border:1px solid rgba(139,92,246,0.25);
    display:flex;align-items:center;justify-content:center;font-size:15px;
    transition:transform 0.2s ease;
  }
  .tf-feature:hover .tf-feature-icon { transform:scale(1.15) rotate(8deg); }

  /* stagger delays on features */
  .tf-feature:nth-child(1) { animation:tf-fade-up 0.5s 0.55s ease both; opacity:0; }
  .tf-feature:nth-child(2) { animation:tf-fade-up 0.5s 0.68s ease both; opacity:0; }
  .tf-feature:nth-child(3) { animation:tf-fade-up 0.5s 0.81s ease both; opacity:0; }

  /* testimonial */
  .tf-testimonial {
    margin-top:52px;padding:20px 22px;border-radius:18px;
    background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
    backdrop-filter:blur(12px);max-width:480px;
    animation:tf-fade-up 0.6s 1.1s ease both;opacity:0;
  }
  .tf-stars { display:flex;gap:3px;margin-bottom:10px; }
  .tf-star  { color:#fbbf24;font-size:13px; }
  .tf-quote { color:#94a3b8;font-size:14px;line-height:1.7; }
  .tf-author { display:flex;align-items:center;gap:10px;margin-top:14px; }
  .tf-avatar {
    width:32px;height:32px;border-radius:999px;
    background:linear-gradient(135deg,#8b5cf6,#3b82f6);
    display:flex;align-items:center;justify-content:center;
    color:white;font-size:13px;font-weight:700;
  }
  .tf-author-name { color:#e2e8f0;font-size:13px;font-weight:600; }
  .tf-author-role { color:#475569;font-size:12px; }

  /* right panel */
  .tf-right {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-right: 48px;
  padding-left: 10px;
  position: relative;
  z-index: 2;
}
  .tf-separator {
    position:absolute;left:0;top:10%;bottom:10%;width:1px;
    background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.06) 30%,rgba(255,255,255,0.06) 70%,transparent);
  }

  /* card */
  .tf-card {
    width:100%;
    background:rgba(10,14,28,0.8);
    border:1px solid rgba(255,255,255,0.07);
    backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
    border-radius:28px;padding:40px 36px;
    box-shadow:0 40px 100px rgba(0,0,0,0.65),inset 0 0 0 0.5px rgba(255,255,255,0.04);
    position:relative;overflow:hidden;
    animation:tf-slide-in 0.7s 0.3s ease both;opacity:0;
  }
  .tf-card-top-line {
    position:absolute;top:0;left:20%;right:20%;height:1px;
    background:linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent);
  }
  .tf-card-glow {
    position:absolute;top:-60px;left:50%;transform:translateX(-50%);
    width:180px;height:180px;border-radius:999px;
    background:rgba(109,40,217,0.08);filter:blur(50px);pointer-events:none;
  }

  .tf-card-title { color:white;font-size:26px;font-weight:800;margin-bottom:6px;letter-spacing:-0.04em; }
  .tf-card-sub   { color:#475569;font-size:14px;margin-bottom:28px; }

  /* error banner */
  .tf-error-banner {
    margin-bottom:20px;padding:13px 16px;border-radius:13px;
    background:rgba(239,68,68,0.09);border:1px solid rgba(239,68,68,0.22);
    color:#fca5a5;font-size:13.5px;
    display:flex;align-items:flex-start;gap:10px;
    animation:tf-slide-err 0.25s ease both;
  }

  /* form */
  .tf-form { display:flex;flex-direction:column;gap:22px; }

  /* input wrapper */
  .tf-field { position:relative; }
  .tf-field-label {
    position:absolute;left:16px;font-weight:600;letter-spacing:0.02em;
    pointer-events:none;z-index:2;
    transition:top 0.18s ease,font-size 0.18s ease,color 0.18s ease;
  }
  .tf-field-label.floated { top:8px;font-size:11px; }
  .tf-field-label.resting { top:18px;font-size:14px; }
  .tf-field-label.focused { color:#a78bfa; }
  .tf-field-label.errored { color:#f87171; }
  .tf-field-label.normal  { color:#64748b; }

  .tf-input-wrap {
    border-radius:14px;
    transition:box-shadow 0.2s ease;
  }
  .tf-input-wrap.focused-ok  { box-shadow:0 0 0 2px rgba(167,139,250,0.5),0 0 32px rgba(139,92,246,0.18); }
  .tf-input-wrap.focused-err { box-shadow:0 0 0 2px rgba(248,113,113,0.45); }
  .tf-input-wrap.idle-err    { box-shadow:0 0 0 1.5px rgba(248,113,113,0.35); }
  .tf-input-wrap.idle-ok     { box-shadow:0 0 0 1px rgba(255,255,255,0.06); }

  .tf-input {
    width:100%;height:58px;border-radius:14px;border:none;
    background:rgba(15,20,40,0.7);color:white;
    padding-left:16px;padding-right:48px;
    font-size:15px;outline:none;font-family:inherit;
    transition:padding 0.18s ease;
  }
  .tf-input.floated { padding-top:22px;padding-bottom:8px; }
  .tf-input::placeholder { color:#2d3748; }
  .tf-input:-webkit-autofill,
  .tf-input:-webkit-autofill:focus {
    transition:background-color 600000s 0s,color 600000s 0s;
    -webkit-text-fill-color:white !important;caret-color:white;
  }

  .tf-field-right { position:absolute;right:14px;top:50%;transform:translateY(-50%); }

  .tf-field-error {
    display:flex;align-items:center;gap:5px;
    color:#f87171;font-size:12px;margin-top:6px;padding-left:4px;
    animation:tf-fade-up 0.2s ease both;
  }

  /* forgot link row */
  .tf-forgot-row { display:flex;justify-content:flex-end;margin-bottom:4px; }
  .tf-forgot-link { color:#7c3aed;text-decoration:none;font-size:12.5px;font-weight:600; }
  .tf-forgot-link:hover { color:#a78bfa; }

  /* remember */
  .tf-remember { display:flex;align-items:center;gap:10px;margin-top:-6px; }
  .tf-checkbox {
    width:18px;height:18px;border-radius:5px;flex-shrink:0;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all 0.2s ease;
  }
  .tf-checkbox.checked  { background:linear-gradient(135deg,#7c3aed,#2563eb);border:none; }
  .tf-checkbox.unchecked{ background:rgba(15,20,40,0.6);border:1.5px solid rgba(255,255,255,0.12); }
  .tf-remember-label { color:#64748b;font-size:13.5px;cursor:pointer;user-select:none; }

  /* submit btn */
  .tf-submit-btn {
    width:100%;height:54px;border:none;border-radius:14px;
    color:white;font-size:15px;font-weight:700;
    display:flex;align-items:center;justify-content:center;gap:8px;
    letter-spacing:-0.01em;font-family:inherit;
    transition:transform 0.15s ease, box-shadow 0.15s ease, background 0.3s ease;
    box-shadow:0 16px 40px rgba(124,58,237,0.38),inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .tf-submit-btn.ready  { background:linear-gradient(135deg,#7c3aed,#2563eb);cursor:pointer; }
  .tf-submit-btn.success{ background:linear-gradient(135deg,#059669,#10b981);cursor:default; }
  .tf-submit-btn.loading{ background:linear-gradient(135deg,#7c3aed,#2563eb);cursor:default;opacity:0.8; }
  .tf-submit-btn.ready:hover  { transform:scale(1.02);box-shadow:0 24px 56px rgba(124,58,237,0.5); }
  .tf-submit-btn.ready:active { transform:scale(0.98); }

  /* divider */
  .tf-divider { display:flex;align-items:center;gap:14px;margin:24px 0; }
  .tf-divider-line { flex:1;height:1px;background:rgba(255,255,255,0.06); }
  .tf-divider-text { color:#374151;font-size:12px;font-weight:500;letter-spacing:0.04em; }

  /* social */
  .tf-social-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
  .tf-social-btn {
    height:46px;border-radius:12px;
    background:rgba(15,20,40,0.7);border:1px solid rgba(255,255,255,0.07);
    color:#94a3b8;font-size:13.5px;font-weight:600;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
    font-family:inherit;
    transition:transform 0.15s ease, box-shadow 0.15s ease, border-color 0.2s ease;
  }
  .tf-social-btn:hover { transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,0.35);border-color:rgba(255,255,255,0.14); }
  .tf-social-btn:active{ transform:scale(0.97); }

  /* footer */
  .tf-card-footer { margin-top:24px;text-align:center;color:#374151;font-size:13.5px; }
  .tf-register-link { color:#a78bfa;text-decoration:none;font-weight:700;letter-spacing:-0.01em; }
  .tf-register-link:hover { color:#c4b5fd; }

  /* left panel staggered reveal */
  .tf-logo-link   { animation:tf-fade-up 0.5s 0.2s ease both;opacity:0; }
  .tf-badge       { animation:tf-fade-up 0.5s 0.3s ease both;opacity:0; }
  .tf-h1          { animation:tf-fade-up 0.5s 0.38s ease both;opacity:0; }
  .tf-subtext     { animation:tf-fade-up 0.5s 0.46s ease both;opacity:0; }
  .tf-features    { animation:tf-fade-up 0.5s 0.5s ease both;opacity:0; }
  .tf-card-header { animation:tf-fade-up 0.4s 0.5s ease both;opacity:0; }

  /* eye toggle btn */
  .tf-eye-btn {
    background:none;border:none;color:#475569;cursor:pointer;
    padding:4px;display:flex;align-items:center;
    transition:color 0.15s ease, transform 0.15s ease;
  }
  .tf-eye-btn:hover { color:#94a3b8;transform:scale(1.1); }
`;

/* ─── StyleInjector ─────────────────────────────────────────────────────── */
function StyleInjector() {
  useEffect(() => {
    const id = "tf-login-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
  return null;
}

/* ─── Input with floating label ─────────────────────────────────────────── */
function InputField({ label, id, type, placeholder, value, onChange, error, rightSlot }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  const labelClass = [
    "tf-field-label",
    floated  ? "floated"  : "resting",
    focused  ? "focused"  : error ? "errored" : "normal",
  ].join(" ");

  const wrapClass = [
    "tf-input-wrap",
    focused && !error ? "focused-ok"  :
    focused &&  error ? "focused-err" :
   !focused &&  error ? "idle-err"    : "idle-ok",
  ].join(" ");

  return (
    <div className="tf-field">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className={wrapClass}>
        <input
          id={id}
          type={type || "text"}
          placeholder={floated ? placeholder : ""}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={id}
          className={"tf-input" + (floated ? " floated" : "")}
        />
      </div>
      {rightSlot && <div className="tf-field-right">{rightSlot}</div>}
      {error && (
        <div className="tf-field-error" key={error}>
          <AlertCircle size={12} />{error}
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login }   = useContext(AuthContext);
  const { toast }   = useToast();
  const navigate    = useNavigate();

  const [form, setForm]             = useState({ email: "", password: "" });
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});
  const [showPass, setShowPass]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess]       = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await login(form.email, form.password);
      setSuccess(true);
      toast("Welcome back!", "success");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      toast(err?.response?.data?.message || "Invalid credentials", "error");
      setErrors({ general: err?.response?.data?.message || "Login failed. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  const btnClass = success ? "tf-submit-btn success" : loading ? "tf-submit-btn loading" : "tf-submit-btn ready";

  return (
    <>
      <StyleInjector />
      <div className="tf-root">

        {/* noise */}
        <svg className="tf-noise" xmlns="http://www.w3.org/2000/svg">
          <filter id="tf-noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#tf-noise-filter)" />
        </svg>

        <div className="tf-grid" />
        <div className="tf-orb tf-orb1" />
        <div className="tf-orb tf-orb2" />
        <div className="tf-orb tf-orb3" />

        {/* ── LEFT ── */}
        <div className="tf-left">

          <Link to="/" className="tf-logo-link">
            <div className="tf-logo-icon">
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <div className="tf-logo-name">TaskFlow</div>
              <div className="tf-logo-sub">Organize work beautifully.</div>
            </div>
          </Link>

          <div className="tf-badge">
            <span className="tf-badge-dot" />
            Now in public beta
          </div>

          <h1 className="tf-h1">
            Manage tasks<br />
            <span className="tf-gradient-text">without chaos.</span>
          </h1>

          <p className="tf-subtext">
            TaskFlow helps teams organize projects, manage deadlines,
            and collaborate in a clean visual workspace.
          </p>

          <div className="tf-features">
            {[
              { icon: "⠿", text: "Drag & drop Kanban boards" },
              { icon: "◎", text: "Assign tasks to teammates"  },
              { icon: "↗", text: "Track progress in real time" },
            ].map(({ icon, text }) => (
              <div key={text} className="tf-feature">
                <div className="tf-feature-icon">{icon}</div>
                <span>{text}</span>
              </div>
            ))}
          </div>

         
        </div>

        {/* ── RIGHT ── */}
        <div className="tf-right">
          <div className="tf-separator" />

          <div className="tf-card">
            <div className="tf-card-top-line" />
            <div className="tf-card-glow" />

            <div className="tf-card-header">
              <h2 className="tf-card-title">Welcome back</h2>
              <p className="tf-card-sub">Sign in to continue to your workspace.</p>
            </div>

            {errors.general && (
              <div className="tf-error-banner" key={errors.general}>
                <AlertCircle size={15} style={{ marginTop: "1px", flexShrink: 0 }} />
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="tf-form">

              <InputField
                label="Email address" id="email" type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                error={errors.email}
              />

              <div>
                <div className="tf-forgot-row">
                  <Link to="/forgot-password" className="tf-forgot-link">Forgot password?</Link>
                </div>
                <InputField
                  label="Password" id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  error={errors.password}
                  rightSlot={
                    <button
                      type="button"
                      className="tf-eye-btn"
                      onClick={() => setShowPass((p) => !p)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              </div>

              <div className="tf-remember">
                <div
                  className={"tf-checkbox " + (rememberMe ? "checked" : "unchecked")}
                  onClick={() => setRememberMe((v) => !v)}
                  role="checkbox"
                  aria-checked={rememberMe}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && setRememberMe((v) => !v)}
                >
                  {rememberMe && <CheckCircle2 size={13} color="white" strokeWidth={3} />}
                </div>
                <span className="tf-remember-label" onClick={() => setRememberMe((v) => !v)}>
                  Remember me for 30 days
                </span>
              </div>

              <button type="submit" disabled={loading || success} className={btnClass}>
                {success ? (
                  <><CheckCircle2 size={18} /> Signed in!</>
                ) : loading ? (
                  <><Loader2 size={18} style={{ animation: "tf-spin 0.8s linear infinite" }} /> Signing in…</>
                ) : (
                  <>Sign in <ArrowRight size={17} /></>
                )}
              </button>

            </form>

            <div className="tf-divider">
              <div className="tf-divider-line" />
              <span className="tf-divider-text">OR CONTINUE WITH</span>
              <div className="tf-divider-line" />
            </div>

            <div className="tf-social-grid">
              {[
                { label: "Google",    icon: "G",  color: "#ea4335" },
                { label: "Microsoft", icon: "⊞", color: "#00a4ef" },
              ].map(({ label, icon, color }) => (
                <button key={label} type="button" className="tf-social-btn">
                  <span style={{ color, fontSize: "16px", fontWeight: 800 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            <div className="tf-card-footer">
              Don't have an account?{" "}
              <Link to="/register" className="tf-register-link">Create account →</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}