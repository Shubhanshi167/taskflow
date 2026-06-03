export default function Logo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px"
      }}
    >
      {/* Logo box */}
      <div
  style={{
    width:"48px",
    height:"48px",
    borderRadius:"16px",

    background:
    "linear-gradient(135deg,#8b5cf6,#6366f1)",

    border:
    "1px solid rgba(255,255,255,.08)",

    backdropFilter:"blur(12px)",

    boxShadow:
    "0 12px 30px rgba(124,58,237,.35)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          color: "white",
          fontWeight: "700",
          fontSize: "20px",

          boxShadow:
            "0 10px 30px rgba(124,58,237,.35)"
        }}
      >
        TF
      </div>

      <div>
        <div
          style={{
            color: "var(--text)",
            fontSize: "20px",
            fontWeight: "700",
            letterSpacing: "-0.5px"
          }}
        >
          TaskFlow
        </div>

        <div
          style={{
            color: "var(--muted)",
            fontSize: "11px"
          }}
        >
          Work together. Move faster.
        </div>
      </div>
    </div>
  )
}