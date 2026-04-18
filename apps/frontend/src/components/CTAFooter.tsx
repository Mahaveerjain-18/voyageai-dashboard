"use client";

interface CTAFooterProps {
  onStart: () => void;
}

export function CTAFooter({ onStart }: CTAFooterProps) {
  return (
    <section className="section" style={{ paddingBottom: 120 }}>
      <div className="container" style={{ textAlign: "center" }}>
        <h2 className="cta-heading">
          Every dollar tells you exactly where it went.
        </h2>

        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
          It takes about a minute to set up. Your wallet is created automatically.
          You can start with as little as $50 USDC.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button onClick={onStart} className="btn-primary" style={{ padding: "16px 32px" }}>
            Plan my trip
          </button>
          <a href="#how" className="btn-secondary" style={{ padding: "16px 32px" }}>
            Learn more
          </a>
        </div>

        {/* Footer links */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="serif-italic" style={{ fontSize: "1rem" }}>Voyage</span>
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>AI</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Powered by Locus</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>USDC on Base</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Paygentic Hackathon 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
