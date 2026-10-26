import { useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CheckCircle2,
  ChevronDown, CircleHelp, Compass, FileText, Gauge, Layers3, LockKeyhole,
  Search, Settings2, ShieldCheck, SlidersHorizontal, Target, Wallet,
} from "lucide-react";

type Section = "Overview" | "Ventures" | "Acquisition" | "Finance" | "Operations" | "Evidence & decisions";

const navigation: { label: Section; icon: typeof Gauge; note: string }[] = [
  { label: "Overview", icon: Gauge, note: "Portfolio command centre" },
  { label: "Ventures", icon: BriefcaseBusiness, note: "Lifecycle and stage gates" },
  { label: "Acquisition", icon: Target, note: "Pipeline and repeatable growth" },
  { label: "Finance", icon: Wallet, note: "Cash, commitments and forecasts" },
  { label: "Operations", icon: Layers3, note: "Work, controls and obligations" },
  { label: "Evidence & decisions", icon: FileText, note: "Sources, approvals and rationale" },
];

const sectionCopy: Record<Section, { eyebrow: string; title: string; description: string }> = {
  Overview: {
    eyebrow: "PORTFOLIO COMMAND CENTRE",
    title: "Build deliberately. Allocate attention wisely.",
    description: "A clear view of what each venture needs next — grounded in evidence, not guesswork.",
  },
  Ventures: {
    eyebrow: "VENTURE REGISTRY",
    title: "Every venture has a stage and a reason.",
    description: "Track ownership, validation, milestones, constraints and the evidence required to move forward.",
  },
  Acquisition: {
    eyebrow: "CUSTOMER ACQUISITION",
    title: "Turn scattered outreach into a repeatable system.",
    description: "Connect target segments, offers, prospects, follow-ups, conversions and retention.",
  },
  Finance: {
    eyebrow: "FINANCIAL CONTROL",
    title: "Know where the money goes — and why.",
    description: "Separate cash movement, revenue, costs, owner funding and inter-venture balances.",
  },
  Operations: {
    eyebrow: "OPERATING SYSTEM",
    title: "Make execution visible and accountable.",
    description: "Bring tasks, standard procedures, obligations, incidents and approvals into one governed workflow.",
  },
  "Evidence & decisions": {
    eyebrow: "DECISION RECORD",
    title: "Keep the evidence behind every important call.",
    description: "Record sources, assumptions, uncertainty, decision owners, rationale and the next review date.",
  },
};

function App() {
  const [activeSection, setActiveSection] = useState<Section>("Overview");
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const active = sectionCopy[activeSection];

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActiveSection("Overview")} aria-label="DAWG 360 home">
          <span className="brand-mark">D</span>
          <span className="brand-copy"><strong>DAWG 360°</strong><small>VENTURE PORTFOLIO</small></span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">OV</span>
          <span className="workspace-copy"><strong>Orion Ventures</strong><small>Portfolio workspace</small></span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, note }) => (
            <button
              key={label}
              className={`nav-item ${activeSection === label ? "active" : ""}`}
              onClick={() => setActiveSection(label)}
              aria-current={activeSection === label ? "page" : undefined}
              title={note}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Evidence & decisions" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-icon"><ShieldCheck size={17} /></span>
          <div><strong>Evidence before scale</strong><p>Move forward when the proof supports it.</p></div>
        </div>
        <button className="nav-item muted-nav" onClick={() => setHelpOpen((value) => !value)}>
          <CircleHelp size={17} /><span>Help & principles</span>
        </button>
        {helpOpen && (
          <div className="help-popover" role="status">
            <strong>Operating principles</strong>
            <p>No invented metrics. No hidden financial adjustments. No consequential AI action without human approval.</p>
          </div>
        )}
        <button className="profile-row" onClick={() => setActiveSection("Operations")}>
          <span className="profile-avatar">O</span>
          <span className="profile-copy"><strong>Workspace owner</strong><small>Access settings</small></span>
          <Settings2 size={16} />
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Orion Ventures</span><span className="crumb-slash">/</span><strong>{activeSection}</strong></div>
          <div className="top-actions">
            <span className="environment-chip"><span className="environment-dot" /> FOUNDATION PREVIEW</span>
            <button className="icon-button" aria-label="Search workspace" onClick={() => setSearchOpen((value) => !value)}><Search size={18} /></button>
            <button className="icon-button" aria-label="Filter view" onClick={() => setActiveSection("Evidence & decisions")}><SlidersHorizontal size={18} /></button>
            <button className="owner-button" onClick={() => setActiveSection("Operations")}><span className="profile-avatar small">O</span><ChevronDown size={14} /></button>
          </div>
        </header>

        {searchOpen && (
          <div className="search-panel">
            <Search size={17} />
            <input aria-label="Search portfolio" placeholder="Search ventures, decisions, prospects…" autoFocus />
            <button onClick={() => setSearchOpen(false)}>Close</button>
          </div>
        )}

        <section className="page-content">
          <div className="welcome-line">
            <span className="eyebrow">{active.eyebrow}</span>
            <span className="date-note">FOUNDATION PHASE <span>·</span> EVIDENCE FIRST</span>
          </div>
          <div className="hero-row">
            <div className="hero-copy">
              <h1>{active.title}</h1>
              <p className="hero-description">{active.description}</p>
            </div>
            <button className="secondary-button" onClick={() => setActiveSection("Evidence & decisions")}><FileText size={16} /> View principles</button>
          </div>

          <div className="readiness-banner">
            <div className="readiness-icon"><Activity size={19} /></div>
            <div className="readiness-copy">
              <strong>Foundation in progress</strong>
              <p>This workspace is not connected to live portfolio records yet. No venture, financial or customer figures are being represented as real.</p>
            </div>
            <span className="readiness-status">NOT CONNECTED</span>
          </div>

          {activeSection === "Overview" ? (
            <>
              <div className="section-heading">
                <div><h2>Portfolio at a glance</h2><p>Live indicators will appear when verified records are connected.</p></div>
                <button className="text-button" onClick={() => setActiveSection("Ventures")}>Explore venture registry <ArrowUpRight size={15} /></button>
              </div>
              <div className="metric-grid">
                <MetricCard label="Active ventures" value="—" detail="Awaiting verified records" icon={BriefcaseBusiness} />
                <MetricCard label="Cash position" value="—" detail="No financial source connected" icon={Wallet} />
                <MetricCard label="Qualified prospects" value="—" detail="No acquisition records yet" icon={Target} />
                <MetricCard label="Decisions due" value="—" detail="No review schedule configured" icon={CheckCircle2} />
              </div>

              <div className="content-grid">
                <section className="surface priority-surface">
                  <div className="surface-heading"><div><span className="section-kicker">ATTENTION & ALLOCATION</span><h2>What needs attention?</h2></div><span className="quiet-tag">Evidence-led</span></div>
                  <div className="empty-state">
                    <div className="empty-illustration"><Compass size={24} strokeWidth={1.5} /></div>
                    <h3>Start with the facts, not a score</h3>
                    <p>Once venture records exist, this space will surface overdue decisions, cash pressure, stalled validation and risks — with a link to the source behind each signal.</p>
                    <button className="outline-button" onClick={() => setActiveSection("Evidence & decisions")}>How decisions are scored <ArrowUpRight size={15} /></button>
                  </div>
                </section>
                <section className="surface principles-surface">
                  <div className="surface-heading"><div><span className="section-kicker">OPERATING PRINCIPLES</span><h2>How the portfolio works</h2></div></div>
                  <Principle icon={CheckCircle2} title="Validate before investing" description="Use low-cost experiments to test demand and willingness to pay." />
                  <Principle icon={Wallet} title="Allocate capital by evidence" description="Compare expected outcomes, cash needs and downside exposure." />
                  <Principle icon={LockKeyhole} title="Keep a decision trail" description="Record who decided, why, on what evidence and when to review." />
                  <div className="principles-footer"><span>One portfolio. Clear accountability.</span><ArrowDownRight size={15} /></div>
                </section>
              </div>
            </>
          ) : (
            <section className="surface section-placeholder">
              <div className="placeholder-icon"><Layers3 size={23} /></div>
              <span className="section-kicker">{active.eyebrow}</span>
              <h2>{activeSection} is being designed around real workflows.</h2>
              <p>The navigation and information architecture are in place. This section will be implemented against a versioned data model, tested authorization rules and auditable records — not mock business data.</p>
              <div className="placeholder-checklist">
                <span><CheckCircle2 size={15} /> Product requirements defined</span>
                <span><CheckCircle2 size={15} /> Data and permission model pending verification</span>
                <span><Activity size={15} /> Workflow implementation not yet complete</span>
              </div>
              <button className="outline-button" onClick={() => setActiveSection("Overview")}>Back to command centre</button>
            </section>
          )}

          <footer className="page-footer">
            <span>DAWG 360° <span className="footer-dot">·</span> Portfolio operating system</span>
            <span><LockKeyhole size={13} /> Evidence-led by design</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Gauge }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={17} /></span></div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
    </article>
  );
}

function Principle({ icon: Icon, title, description }: { icon: typeof Gauge; title: string; description: string }) {
  return (
    <div className="principle-row">
      <span className="principle-icon"><Icon size={17} /></span>
      <div><strong>{title}</strong><p>{description}</p></div>
    </div>
  );
}

export default App;