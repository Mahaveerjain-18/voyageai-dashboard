"use client";

export function Features() {
  const features = [
    { icon: "🔒", label: "Escrow Subwallets", desc: "Funds locked until trip ends" },
    { icon: "🤖", label: "6 Research APIs", desc: "Brave, Firecrawl, Weather, Maps, Gemini, Screenshots" },
    { icon: "💳", label: "Virtual Debit Cards", desc: "One-time cards via Laso Finance" },
    { icon: "📊", label: "Live Audit Trail", desc: "Every AI decision logged in real-time" },
    { icon: "👥", label: "Group Funding", desc: "Shareable checkout links for friends" },
    { icon: "⚡", label: "Spending Controls", desc: "Per-category budget enforcement" },
    { icon: "📧", label: "Email Confirmations", desc: "Booking proofs sent via pay/send-email" },
    { icon: "🌤️", label: "Weather Guard", desc: "Auto-cancel if storms are detected" },
    { icon: "💰", label: "Price Watch", desc: "Rebooks when prices drop" },
  ];

  return (
    <section id="features" className="section">
      <div className="container">
        <p className="section-label">CAPABILITIES</p>
        <h2 className="section-heading">
          What <span className="italic">powers</span> the agent?
        </h2>
        <p className="section-subtext" style={{ marginBottom: 48 }}>
          Seven Locus capabilities chained into one autonomous flow.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}>
          {features.map((f, i) => (
            <div key={i} className="card feature-card">
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.15rem",
                fontWeight: 600,
                marginBottom: 8,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}>
                {f.label}
              </h3>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                fontWeight: 400,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Composability chain */}
        <div style={{
          marginTop: 48,
          padding: "24px 32px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 0,
        }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
            7 LOCUS CAPABILITIES IN ONE FLOW
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {["Checkout", "→", "Subwallet", "→", "Wrapped APIs", "→", "Laso Card", "→", "pay/send", "→", "Email Escrow", "→", "Audit"].map((item, i) =>
              item === "→" ? (
                <span key={i} style={{ color: "var(--text-faint)", fontSize: "0.85rem" }}>→</span>
              ) : (
                <span key={i} className="badge-accent badge" style={{ borderRadius: 0 }}>{item}</span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
