"use client";

import { useEffect, useState } from "react";

interface HeroProps {
  onStartPlanning: () => void;
}

export function Hero({ onStartPlanning }: HeroProps) {
  const [visible, setVisible] = useState(false);
  const [chatStep, setChatStep] = useState(0);

  useEffect(() => {
    setVisible(true);
    const timers = [
      setTimeout(() => setChatStep(1), 800),
      setTimeout(() => setChatStep(2), 2000),
      setTimeout(() => setChatStep(3), 3500),
      setTimeout(() => setChatStep(4), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="section" style={{ paddingTop: 160, paddingBottom: 100 }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        {/* Left: Copy */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <p className="section-label" style={{ color: "var(--accent)" }}>
            AI-POWERED TRAVEL · ON-CHAIN PAYMENTS
          </p>

          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
            marginBottom: 24,
          }}>
            Travel with<br />intent.
          </h1>

          <p className="section-subtext" style={{ marginBottom: 32 }}>
            Chat with an AI agent that researches, books, and pays for your
            vacation. Every transaction is USDC on Base — traceable, verifiable,
            autonomous. No more 47 open tabs.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onStartPlanning} className="btn-primary">
              Plan my trip
            </button>
            <a href="#how" className="btn-secondary">
              See how it works ↓
            </a>
          </div>
        </div>

        {/* Right: Agent Widget Demo */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
        }}>
          <div className="agent-widget">
            <div className="agent-widget-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>✈️</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>TRAVEL AGENT</span>
              </div>
              <span className="badge-live" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="dot" style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                LIVE
              </span>
            </div>

            <div className="agent-widget-body">
              {chatStep >= 1 && (
                <div className="chat-bubble-user slide-up">
                  5 days in Tokyo, July, budget $2000
                </div>
              )}

              {chatStep >= 2 && chatStep < 3 && (
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              )}

              {chatStep >= 3 && (
                <div className="chat-bubble-agent slide-up">
                  Found 3 options within budget. Flights $580–$720, hotels $85–$140/night. Weather: 28°C, partly cloudy.
                </div>
              )}

              {chatStep >= 4 && (
                <div className="slide-up" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    3 MATCHES · VERIFIED
                  </div>
                  {[
                    { name: "ANA Direct Flight + Shinjuku Hotel", score: "94", price: "$1,640" },
                    { name: "JAL via Osaka + Shibuya Boutique", score: "89", price: "$1,420" },
                    { name: "United Nonstop + Asakusa Ryokan", score: "86", price: "$1,780" },
                  ].map((r, i) => (
                    <div key={i} className="result-item">
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{r.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                          FLIGHTS · HOTEL · {r.price}
                        </div>
                      </div>
                      <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>{r.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="agent-widget-footer">
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Try the real agent →</span>
              <button
                onClick={onStartPlanning}
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.8rem", borderRadius: 8 }}
              >
                PLAN TRIP
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
