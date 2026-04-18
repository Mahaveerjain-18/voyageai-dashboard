"use client";

import { useRef, useEffect } from "react";
import { AuditEntry } from "@/lib/api";

interface AuditLogPanelProps {
  logs: AuditEntry[];
}

const SEVERITY_CLASS: Record<string, string> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

const AGENT_COLORS: Record<string, string> = {
  Research: "#60a5fa",
  Booking: "#fb923c",
  Delivery: "#22d3ee",
  CFO: "#34d399",
  System: "#a78bfa",
};

export function AuditLogPanel({ logs }: AuditLogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="card-flat" style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 120px)" }}>
      {/* Terminal header */}
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot-red" />
          <span className="dot-yellow" />
          <span className="dot-green" />
        </div>
        <span className="terminal-title">Mission Control</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "0.65rem", color: "var(--accent)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>LIVE</span>
        </div>
      </div>

      {/* Logs */}
      <div ref={scrollRef} className="terminal" style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-faint)" }}>
            <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>📋</p>
            <p style={{ fontSize: "0.8rem" }}>Waiting for agent activity…</p>
          </div>
        ) : (
          logs.map((entry) => {
            const cls = SEVERITY_CLASS[entry.severity] || "info";
            const agentColor = AGENT_COLORS[entry.agentName] || "var(--text-muted)";
            return (
              <div key={entry.id} className={`log-entry ${cls}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-faint)" }}>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: agentColor }}>
                    [{entry.agentName}]
                  </span>
                  {entry.apiCost != null && entry.apiCost > 0 && (
                    <span className="mono" style={{ fontSize: "0.65rem", color: "var(--text-faint)" }}>
                      ${entry.apiCost.toFixed(4)}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4, wordBreak: "break-word" }}>
                  {entry.action}
                </p>
                {entry.reasoning && (
                  <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginTop: 2, wordBreak: "break-word" }}>
                    {entry.reasoning}
                  </p>
                )}
                {entry.txHash && (
                  <p className="mono" style={{ fontSize: "0.65rem", color: "var(--accent)", opacity: 0.6, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    tx: {entry.txHash}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
        <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{logs.length} entries</span>
        <span className="mono" style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>
          ${logs.reduce((s, l) => s + (l.apiCost || 0), 0).toFixed(4)} API cost
        </span>
      </div>
    </div>
  );
}
