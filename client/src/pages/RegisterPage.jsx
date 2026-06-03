import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
function InputField({
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  rightSlot,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#94a3b8",
          fontSize: "13px",
          marginBottom: "8px",
          fontWeight: "600",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: "56px",
            borderRadius: "14px",
            border: error
              ? "1px solid rgba(248,113,113,0.5)"
              : "1px solid rgba(255,255,255,0.08)",
            background: "rgba(15,23,42,0.75)",
            color: "white",
            padding: "0 16px",
            paddingRight: "48px",
            outline: "none",
            fontSize: "14px",
            transition: "0.2s",
            backdropFilter: "blur(10px)",
          }}
        />

        {rightSlot && (
          <div
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            color: "#f87171",
            fontSize: "12px",
            marginTop: "6px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};

    if (!form.username || form.username.length < 2) {
      e.username = "Username must be at least 2 characters";
    }

    if (!form.email) {
      e.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = "Invalid email address";
    }

    if (!form.password || form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    if (form.password !== form.confirm) {
      e.confirm = "Passwords do not match";
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await register(
        form.username,
        form.email,
        form.password
      );

      setSuccess(true);

      toast("Account created successfully 🎉", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      setErrors({
        general:
          err?.response?.data?.message ||
          "Registration failed",
      });

      toast("Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const strength = () => {
    const p = form.password;

    let s = 0;

    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;

    return s;
  };

  const strengthColors = [
    "#1e293b",
    "#ef4444",
    "#f59e0b",
    "#06b6d4",
    "#10b981",
    "#22c55e",
  ];

  const strengthLabels = [
    "",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ];

  

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* BACKGROUND */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(circle at center, black, transparent 85%)",
        }}
      />

      {/* GLOW */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(124,58,237,0.18)",
          filter: "blur(120px)",
          borderRadius: "999px",
          top: "-100px",
          left: "-120px",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "rgba(37,99,235,0.14)",
          filter: "blur(120px)",
          borderRadius: "999px",
          bottom: "-100px",
          right: "0",
        }}
      />

      {/* LEFT */}
     {/* LEFT */}
<div
  style={{
    flex: 1,
    paddingLeft: "90px",
    paddingRight: "40px",
    paddingTop: "80px",
    paddingBottom: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    zIndex: 2,
    maxWidth: "780px",
  }}
>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            textDecoration: "none",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg,#7c3aed,#2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 20px 40px rgba(124,58,237,0.35)",
            }}
          >
            <Sparkles color="white" size={22} />
          </div>

          <div>
            <div
              style={{
                color: "white",
                fontSize: "22px",
                fontWeight: "800",
              }}
            >
              TaskFlow
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Organize work beautifully.
            </div>
          </div>
        </Link>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "rgba(139,92,246,0.12)",
            border:
              "1px solid rgba(139,92,246,0.22)",
            color: "#a78bfa",
            width: "fit-content",
            marginBottom: "24px",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          ✦ New user onboarding
        </div>

        <h1
          style={{
            fontSize: "68px",
            lineHeight: 0.95,
            fontWeight: "900",
            color: "white",
            maxWidth: "620px",
            letterSpacing: "-0.06em",
            marginBottom: "24px",
          }}
        >
          Start managing <br />

          <span
            style={{
              background:
                "linear-gradient(135deg,#a78bfa,#60a5fa,#34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            work smarter.
          </span>
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "17px",
            lineHeight: 1.8,
            maxWidth: "520px",
            marginBottom: "44px",
          }}
        >
          Join thousands of teams using TaskFlow to
          organize projects, streamline collaboration,
          and stay productive without chaos.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {[
            "Create projects instantly",
            "Collaborate with your team",
            "Track tasks in real-time",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(37,99,235,0.15))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </div>

              {item}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
     {/* RIGHT */}
<div
  style={{
    width: "620px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: "90px",
    position: "relative",
    zIndex: 2,
  }}
>
        <div
          style={{
            width: "100%",
            background: "rgba(10,14,28,0.82)",
            border:
              "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(28px)",
            borderRadius: "30px",
            padding: "48px 42px",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.6)",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "28px",
              fontWeight: "800",
              marginBottom: "8px",
            }}
          >
            Create account
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "28px",
              fontSize: "14px",
            }}
          >
            Start your productivity journey today.
          </p>

          {errors.general && (
            <div
              style={{
                background:
                  "rgba(239,68,68,0.1)",
                border:
                  "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
                padding: "14px 16px",
                borderRadius: "14px",
                marginBottom: "22px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={16} />
              {errors.general}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <InputField
              label="Username"
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
              error={errors.username}
              placeholder="johndoe"
            />

            <InputField
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              error={errors.email}
              placeholder="you@company.com"
            />

            <div>
              <InputField
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                error={errors.password}
                placeholder="Min. 6 characters"
                rightSlot={
                  <button
                    type="button"
                    onClick={() =>
                      setShowPass(!showPass)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {showPass ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />

              {form.password && (
                <div style={{ marginTop: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      marginBottom: "6px",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: "4px",
                          borderRadius: "999px",
                          background:
                            i <= strength()
                              ? strengthColors[
                                  strength()
                                ]
                              : "#1e293b",
                        }}
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        strengthColors[strength()],
                    }}
                  >
                    {strengthLabels[strength()]}
                  </div>
                </div>
              )}
            </div>

            <InputField
              label="Confirm password"
              type="password"
              value={form.confirm}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirm: e.target.value,
                })
              }
              error={errors.confirm}
              placeholder="Repeat password"
            />

            <button
              type="submit"
              disabled={loading || success}
              style={{
                height: "56px",
                borderRadius: "14px",
                border: "none",
                background: success
                  ? "linear-gradient(135deg,#059669,#10b981)"
                  : "linear-gradient(135deg,#7c3aed,#2563eb)",
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                marginTop: "6px",
                boxShadow:
                  "0 20px 40px rgba(124,58,237,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {success ? (
                <>
                  <CheckCircle2 size={18} />
                  Account created
                </>
              ) : loading ? (
                <>
                  <Loader2
                    size={18}
                    style={{
                      animation:
                        "spin 0.8s linear infinite",
                    }}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              margin: "24px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "rgba(255,255,255,0.06)",
              }}
            />

            <span
              style={{
                color: "#475569",
                fontSize: "12px",
              }}
            >
              OR
            </span>

            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "rgba(255,255,255,0.06)",
              }}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Already have an account?{" "}

            <Link
              to="/login"
              style={{
                color: "#a78bfa",
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}