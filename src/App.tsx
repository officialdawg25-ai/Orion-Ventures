import { useState } from "react";

type Section =
  | "overview"
  | "ventures"
  | "acquisition"
  | "finance"
  | "operations"
  | "intelligence"
  | "settings";

type NavItem = {
  id: Section;
  label: string;
  eyebrow?: string;
  icon: string;
};

const primaryNavigation: NavItem[] = [
  { id: "overview", label: "Portfolio overview", icon: "◫" },
  { id: "ventures", label: "Ventures", icon: "◇" },
  { id: "acquisition", label: "Customer engine", icon: "↗" },
  { id: "finance", label: "Financial control", icon: "⌁" },
  { id: "operations", label: "Operations & risk", icon: "☷" },
  { id: "intelligence", label: "Intelligence", icon: "✳" },
];

const pageCopy: Record<Section, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "THE PORTFOLIO",
    title: "See the whole picture.",
    description: "A single operating view for the ventures you build, the capital you allocate and the work that moves each business forward.",
  },
  ventures: {
    eyebrow: "VENTURE REGISTRY",
    title: "Every venture. One clear record.",
    description: "Track each venture's stage, accountable owner, next milestone and evidence without confusing an idea with an operating business.",
  },
  acquisition: {
    eyebrow: "CUSTOMER ENGINE",
    title: "Build repeatable demand.",
    description: "Connect customer hypotheses, channel experiments, follow-ups and outcomes. Measure what is evidenced, not what is assumed.",
  },
  finance: {
    eyebrow: "FINANCIAL CONTROL",
    title: "Know what the numbers mean.",
    description: "Keep actuals, budgets, commitments and forecasts distinct, with every figure traceable to its source records.",
  },
  operations: {
    eyebrow: "OPERATING SYSTEM",
    title: "Turn decisions into delivery.",
    description: "Keep priorities, procedures, obligations and risks connected to accountable owners and review dates.",
  },
  intelligence: {
    eyebrow: "PORTFOLIO INTELLIGENCE",
    title: "Evidence before opinion.",
    description: "The intelligence layer will surface patterns and decision support only after reliable, permission-scoped data is connected.",
  },
  settings: {
    eyebrow: "FOUNDATION",
    title: "Connect the operating layer.",
    description: "The interface is scaffolded, but identity, database access, persistence and deployment are not configured in this revision.",
  },
};

function BrandMark() {
  return (
    <div className="brand-lockup" aria-label="DAWG 360">
      <div className="brand-mark" aria-hidden="true">D<span>360</span></div>
      <div className="brand-name">DAWG <span>VENTURES</span></div>
    </div>
  );
}

function Sidebar({
  active,
  onNavigate,
}: {
  active: Section;
  onNavigate: (section: Section) => void;
}) {
  return (
    <aside className="sidebar">
      <BrandMark />
      <div className="workspace-label">PORTFOLIO WORKSPACE</div>
      <div className="portfolio-switcher">
        <div className="portfolio-avatar">O</div>
        <div className="portfolio-switcher-copy">
          <strong>Orion Ventures</strong>
          <span>Portfolio workspace</span>
        </div>
        <span className="switcher-chevron" aria-hidden="true">⌄</span>
      </div>
      <nav aria-label="Main navigation">
        <div className="nav-group-label">OPERATE</div>
        {primaryNavigation.map((item) => (
          <button
            className={"nav-item" + (active === item.id ? " active" : "")}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={active === item.id ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="note-indicator" />
          <div>
            <strong>Foundation mode</strong>
            <span>Data connection pending</span>
          </div>
        </div>
        <button
          className={"nav-item settings-link" + (active === "settings" ? " active" : "")}
          type="button"
          onClick={() => onNavigate("settings")}
          aria-current={active === "settings" ? "page" : undefined}
        >
          <span className="nav-icon" aria-hidden="true">⚙</span>
          <span>Setup & settings</span>
        </button>
        <div className="profile-row">
          <div className="profile-avatar">OV</div>
          <div className="profile-copy">
            <strong>Portfolio owner</strong>
            <span>Access not configured</span>
          </div>
          <span className="profile-menu" aria-hidden="true">···</span>
        </div>
      </div>
    </aside>
  );
}

function StatusPill({ children }: { children: string }) {
  return <span className="status-pill"><span className="status-dot" />{children}</span>;
}

function EmptyState({ section, onSettings }: { section: Section; onSettings: () => void }) {
  const copy = pageCopy[section];
  return (
    <section className="empty-panel" aria-labelledby="empty-title">
      <div className="empty-symbol" aria-hidden="true">
        {section === "finance" ? "⌁" : section === "ventures" ? "◇" : section === "acquisition" ? "↗" : section === "operations" ? "☷" : section === "intelligence" ? "✳" : "◫"}
      </div>
      <div className="empty-kicker">WAITING FOR A VERIFIED DATA SOURCE</div>
      <h2 id="empty-title">No connected records yet.</h2>
      <p>
        This view will populate from saved portfolio records. It does not contain demo metrics or fabricated venture data.
      </p>
      <button className="button button-dark" type="button" onClick={onSettings}>
        Review setup <span aria-hidden="true">↗</span>
      </button>
    </section>
  );
}

function Overview({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <>
      <section className="welcome-block">
        <div>
          <div className="eyebrow">MONDAY, 26 OCTOBER 2026 <span className="eyebrow-divider">/</span> {pageCopy.overview.eyebrow}</div>
          <h1>{pageCopy.overview.title}</h1>
          <p className="welcome-description">{pageCopy.overview.description}</p>
        </div>
        <button className="button button-outline" type="button" onClick={() => onNavigate("settings")}>
          <span aria-hidden="true">＋</span> Configure workspace
        </button>
      </section>

      <section className="foundation-banner" aria-label="Foundation status">
        <div className="banner-icon" aria-hidden="true">i</div>
        <div className="banner-copy">
          <strong>Your portfolio workspace is being established.</strong>
          <p>The interface is in its foundation phase. Secure sign-in and live data access are not connected yet.</p>
        </div>
        <StatusPill>Setup required</StatusPill>
      </section>

      <section className="section-heading">
        <div>
          <div className="eyebrow">PORTFOLIO SIGNALS</div>
          <h2>What needs your attention</h2>
        </div>
        <span className="muted-label">Live data not connected</span>
      </section>

      <div className="signal-grid">
        <article className="signal-card">
          <div className="signal-card-top"><span>Active ventures</span><span className="signal-icon">◇</span></div>
          <div className="signal-value">—</div>
          <p>Awaiting venture records</p>
        </article>
        <article className="signal-card">
          <div className="signal-card-top"><span>Open decisions</span><span className="signal-icon">⌁</span></div>
          <div className="signal-value">—</div>
          <p>Awaiting decision records</p>
        </article>
        <article className="signal-card">
          <div className="signal-card-top"><span>Cash commitments</span><span className="signal-icon">↗</span></div>
          <div className="signal-value">—</div>
          <p>Awaiting financial records</p>
        </article>
        <article className="signal-card">
          <div className="signal-card-top"><span>Customer pipeline</span><span className="signal-icon">⌘</span></div>
          <div className="signal-value">—</div>
          <p>Awaiting acquisition records</p>
        </article>
      </div>

      <section className="section-heading lower-heading">
        <div>
          <div className="eyebrow">THE OPERATING SYSTEM</div>
          <h2>Build on a trusted foundation</h2>
        </div>
        <span className="muted-label">6 operating areas</span>
      </section>

      <div className="area-grid">
        {primaryNavigation.slice(1).map((item, index) => (
          <button className="area-card" key={item.id} type="button" onClick={() => onNavigate(item.id)}>
            <div className="area-card-head">
              <span className="area-icon" aria-hidden="true">{item.icon}</span>
              <span className="area-arrow" aria-hidden="true">↗</span>
            </div>
            <strong>{item.label}</strong>
            <p>{[
              "Stages, evidence, milestones and venture reviews.",
              "Experiments, leads, conversion and retention.",
              "Actuals, budgets, commitments and cash forecasts.",
              "Tasks, obligations, procedures and risk controls.",
              "Evidence-led insights with human-reviewed decisions.",
            ][index]}</p>
            <span className="area-status">Not connected</span>
          </button>
        ))}
      </div>
    </>
  );
}

function ContentPage({ section, onSettings }: { section: Section; onSettings: () => void }) {
  const copy = pageCopy[section];
  return (
    <>
      <section className="welcome-block page-welcome">
        <div>
          <div className="eyebrow">{copy.eyebrow}</div>
          <h1>{copy.title}</h1>
          <p className="welcome-description">{copy.description}</p>
        </div>
        <StatusPill>Not connected</StatusPill>
      </section>
      {section === "settings" ? (
        <section className="setup-list">
          <div className="setup-list-heading">
            <div className="eyebrow">FOUNDATION CHECKLIST</div>
            <h2>Before this becomes an operating system</h2>
            <p>These steps are intentionally not marked complete until verified.</p>
          </div>
          {[
            ["01", "Identity and access", "Supabase Auth, recovery flows, scoped memberships and privileged-role controls."],
            ["02", "Database and isolation", "Reviewed migrations, row-level security, grants and cross-portfolio negative tests."],
            ["03", "Application persistence", "Real venture, decision, customer and financial records with audit history."],
            ["04", "Environments and recovery", "Isolated staging, secrets separation, backup verification and recovery exercise."],
            ["05", "Release verification", "Automated checks, staging smoke tests, security review and explicit release approval."],
          ].map((item) => (
            <div className="setup-row" key={item[0]}>
              <span className="setup-number">{item[0]}</span>
              <div className="setup-copy"><strong>{item[1]}</strong><p>{item[2]}</p></div>
              <span className="setup-state">Pending</span>
            </div>
          ))}
          <div className="setup-footnote">No production database, secret, or deployment action is performed by this interface.</div>
        </section>
      ) : (
        <EmptyState section={section} onSettings={onSettings} />
      )}
    </>
  );
}

export default function App() {
  const [active, setActive] = useState<Section>("overview");
  const copy = pageCopy[active];

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Orion Ventures</span><span aria-hidden="true">/</span><strong>{active === "overview" ? "Overview" : copy.eyebrow}</strong></div>
          <div className="topbar-actions">
            <span className="environment-label"><span className="environment-dot" /> FOUNDATION</span>
            <button className="icon-button" type="button" aria-label="Open setup and settings" onClick={() => setActive("settings")}>⚙</button>
          </div>
        </header>
        <div className="content-wrap">
          {active === "overview" ? <Overview onNavigate={setActive} /> : <ContentPage section={active} onSettings={() => setActive("settings")} />}
          <footer className="page-footer">
            <span>DAWG 360° <span className="footer-separator">/</span> Portfolio operating system</span>
            <span>Foundation build <span className="footer-separator">·</span> Data connection pending</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
