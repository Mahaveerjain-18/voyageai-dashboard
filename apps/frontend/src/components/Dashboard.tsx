"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTrip,
  getAuditLog,
  triggerResearch,
  approveOptions,
  executeBookings,
  deliverConfirmations,
  Trip,
  AuditEntry,
} from "@/lib/api";
import { AuditLogPanel } from "./AuditLogPanel";

interface DashboardProps {
  tripId: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CREATED:      { label: "Created",        color: "#666",    bg: "rgba(102,102,102,0.08)" },
  FUNDED:       { label: "Funded",         color: "#c8f547", bg: "rgba(200,245,71,0.08)" },
  RESEARCHING:  { label: "Researching…",   color: "#c8f547", bg: "rgba(200,245,71,0.08)" },
  OPTIONS_READY:{ label: "Options Ready",  color: "#c8f547", bg: "rgba(200,245,71,0.08)" },
  BOOKING:      { label: "Booking…",       color: "#c8f547", bg: "rgba(200,245,71,0.08)" },
  CONFIRMED:    { label: "Confirmed",      color: "#c8f547", bg: "rgba(200,245,71,0.08)" },
  DELIVERED:    { label: "Delivered",       color: "#c8f547", bg: "rgba(200,245,71,0.08)" },
  COMPLETED:    { label: "Completed",      color: "#c8f547", bg: "rgba(200,245,71,0.08)" },
  CANCELLED:    { label: "Cancelled",      color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  FAILED:       { label: "Failed",         color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

export function Dashboard({ tripId, onBack }: DashboardProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("traveler@voyageai.com");

  const refreshData = useCallback(async () => {
    try {
      const [t, a] = await Promise.all([getTrip(tripId), getAuditLog(tripId)]);
      setTrip(t);
      setAuditLogs(a.logs);
    } catch (err) {
      console.error(err);
    }
  }, [tripId]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const withAction = async (fn: () => Promise<void>) => {
    setLoading(true);
    await fn();
    await refreshData();
    setLoading(false);
  };

  if (!trip) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(200,245,71,0.2)",
          borderTopColor: "#c8f547",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const status = STATUS_CONFIG[trip.status] || STATUS_CONFIG.CREATED;
  const budgetPct = trip.totalBudget > 0 ? (trip.totalSpent / trip.totalBudget) * 100 : 0;
  const totalApiCost = auditLogs.reduce((s, l) => s + (l.apiCost || 0), 0);

  const categories = [
    { label: "Flights", icon: "✈️", max: trip.spendingLimits.maxFlight, spent: trip.bookings.filter(b => b.type === "flight").reduce((s, b) => s + b.price, 0) },
    { label: "Hotels", icon: "🏨", max: trip.spendingLimits.maxHotel, spent: trip.bookings.filter(b => b.type === "hotel").reduce((s, b) => s + b.price, 0) },
    { label: "Activities", icon: "🎯", max: trip.spendingLimits.maxActivities, spent: trip.bookings.filter(b => b.type === "activity").reduce((s, b) => s + b.price, 0) },
    { label: "Food", icon: "🍱", max: trip.spendingLimits.maxFood, spent: 0 },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 36,
        paddingBottom: 24,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "8px 16px",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.2s",
            }}
          >
            ← Home
          </button>
          <div>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.6rem",
              fontWeight: 600,
              fontStyle: "italic",
              color: "var(--text-primary)",
              marginBottom: 2,
            }}>
              {trip.destination}
            </h1>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              letterSpacing: "0.02em",
            }}>
              {trip.startDate} → {trip.endDate} · {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 16px",
          background: status.bg,
          border: `1px solid ${status.color}30`,
          borderRadius: 10,
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: status.color,
            boxShadow: `0 0 8px ${status.color}60`,
          }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: status.color,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Budget Overview Card */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.15rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}>
                Budget Overview
              </h3>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--text-faint)",
                padding: "4px 10px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 6,
              }}>
                API: ${totalApiCost.toFixed(4)}
              </span>
            </div>

            {/* Stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { label: "BUDGET", value: `$${trip.totalBudget}`, color: "var(--text-primary)" },
                { label: "SPENT", value: `$${trip.totalSpent}`, color: "var(--text-primary)" },
                { label: "REMAINING", value: `$${trip.totalBudget - trip.totalSpent}`, color: "var(--text-primary)" },
                { label: "BOOKINGS", value: `${trip.bookings.length}`, color: "var(--text-primary)" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: "16px 14px",
                  textAlign: "center",
                }}>
                  <p style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    fontWeight: 500,
                    color: "var(--text-faint)",
                    marginBottom: 6,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>{s.label}</p>
                  <p style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: s.color,
                    letterSpacing: "-0.02em",
                  }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Budget bar */}
            <div style={{
              height: 5,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 6,
            }}>
              <div style={{
                height: "100%",
                borderRadius: 3,
                background: budgetPct > 90 ? "#ef4444" : "#c8f547",
                width: `${Math.min(budgetPct, 100)}%`,
                transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }} />
            </div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              color: "var(--text-faint)",
              textAlign: "right",
            }}>
              {budgetPct.toFixed(1)}% used
            </p>

            {/* Category bars */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              {categories.map((c) => {
                const pct = c.max > 0 ? Math.min((c.spent / c.max) * 100, 100) : 0;
                return (
                  <div key={c.label} style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{c.icon}</span> {c.label}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}>
                        ${c.spent}/${c.max}
                      </span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        borderRadius: 2,
                        background: "#c8f547",
                        width: `${pct}%`,
                        transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Controls Card */}
          <div style={cardStyle}>
            <h3 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 18,
            }}>
              Agent Controls
            </h3>

            {trip.status === "FUNDED" && (
              <button
                onClick={() => withAction(() => triggerResearch(tripId))}
                disabled={loading}
                style={{
                  ...actionBtnStyle,
                  background: "#c8f547",
                  color: "#0a0a0a",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "Researching..." : "🔍  Start AI Research"}
              </button>
            )}

            {trip.status === "OPTIONS_READY" && (
              <button
                onClick={() => withAction(() => approveOptions(tripId, trip.options.map(o => o.id)))}
                disabled={loading}
                style={{
                  ...actionBtnStyle,
                  background: "#c8f547",
                  color: "#0a0a0a",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "Approving..." : "✅  Approve All Options"}
              </button>
            )}

            {trip.status === "BOOKING" && (
              <button
                onClick={() => withAction(() => executeBookings(tripId))}
                disabled={loading}
                style={{
                  ...actionBtnStyle,
                  background: "#c8f547",
                  color: "#0a0a0a",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "Booking..." : "💳  Execute Bookings"}
              </button>
            )}

            {trip.status === "CONFIRMED" && (
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email for confirmations"
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    background: "#141414",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    color: "#f5f5f5",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => withAction(() => deliverConfirmations(tripId, email))}
                  disabled={loading}
                  style={{
                    ...actionBtnStyle,
                    width: "auto",
                    padding: "14px 20px",
                    fontSize: "0.85rem",
                    background: "#c8f547",
                    color: "#0a0a0a",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? "Sending..." : "📧  Deliver"}
                </button>
              </div>
            )}

            {trip.status === "DELIVERED" && (
              <div style={{ textAlign: "center", padding: "28px 16px" }}>
                <p style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "1.3rem",
                  color: "#c8f547",
                  marginBottom: 6,
                }}>
                  🎉 Trip Booked & Delivered!
                </p>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                }}>
                  Confirmations sent to {email}
                </p>
              </div>
            )}

            {!["FUNDED", "OPTIONS_READY", "BOOKING", "CONFIRMED", "DELIVERED"].includes(trip.status) && (
              <p style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                textAlign: "center",
                padding: 20,
                fontStyle: "italic",
              }}>
                Waiting for status change...
              </p>
            )}
          </div>

          {/* Options / Bookings list */}
          {(trip.options.length > 0 || trip.bookings.length > 0) && (
            <div style={cardStyle}>
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.15rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 18,
              }}>
                {trip.bookings.length > 0 ? "Bookings" : "Research Results"}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(trip.bookings.length > 0 ? trip.bookings : trip.options).map((item: any) => (
                  <div key={item.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    transition: "border-color 0.2s",
                  }}>
                    <span style={{ fontSize: "1.3rem" }}>
                      {item.type === "flight" ? "✈️" : item.type === "hotel" ? "🏨" : "🎯"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>{item.name}</p>
                      <p style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {item.description || item.provider}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "#c8f547",
                        fontSize: "1rem",
                      }}>
                        ${item.price}
                      </p>
                      {item.confirmationCode && (
                        <p style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.68rem",
                          color: "var(--text-secondary)",
                        }}>
                          {item.confirmationCode}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Audit Log */}
        <AuditLogPanel logs={auditLogs} />
      </div>
    </div>
  );
}

/* ── Style objects ── */

const cardStyle: React.CSSProperties = {
  background: "#161616",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 18,
  padding: "28px 28px",
};

const actionBtnStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "15px 24px",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: "0.92rem",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  transition: "all 0.2s ease",
};
