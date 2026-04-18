"use client";

interface NavProps {
  onLogoClick: () => void;
  onStartPlanning?: () => void;
}

export function Nav({ onLogoClick, onStartPlanning }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <button onClick={onLogoClick} className="nav-logo" style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span className="serif-italic" style={{ fontSize: "1.15rem" }}>Voyage</span>
          <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>AI</span>
        </button>

        <div className="nav-actions">
          <a href="#how" className="btn-ghost">How it works</a>
          <a href="#features" className="btn-ghost">Features</a>
          <a href="#faq" className="btn-ghost">FAQ</a>
          <button
            onClick={onStartPlanning || onLogoClick}
            className="btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.85rem" }}
          >
            Start planning
          </button>
        </div>
      </div>
    </nav>
  );
}
