import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight, ArrowUpRight, BriefcaseBusiness, CheckCircle2, ChevronDown,
  CircleHelp, FileText, Gauge, Layers3, LogOut, ShieldCheck, Target, Wallet,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  createDecision, createEvidence, createPortfolio, createVenture,
  listDecisions, listEvidence, listPortfolios, listVentures,
  type Decision, type EvidenceItem, type Portfolio, type Venture,
} from "../lib/portfolio";

type Section = "Overview" | "Ventures" | "Acquisition" | "Finance" | "Operations" | "Evidence & decisions";
const nav: { label: Section; icon: typeof Gauge; note: string }[] = [
  { label: "Overview", icon: Gauge, note: "Portfolio command centre" },
  { label: "Ventures", icon: BriefcaseBusiness, note: "Registry and lifecycle" },
  { label: "Acquisition", icon: Target, note: "Customer acquisition" },
  { label: "Finance", icon: Wallet, note: "Financial control" },
  { label: "Operations", icon: Layers3, note: "Work and obligations" },
  { label: "Evidence & decisions", icon: FileText, note: "Sources and rationale" },
];
const stages: Record<string, string> = {
  idea_captured: "Idea captured", validation: "Validation", business_case: "Business case",
  launch: "Launch", stabilization: "Stabilization", growth: "Growth", portfolio_review: "Portfolio review",
};
const decisionTypes = ["pass", "hold", "revise", "grow", "maintain", "repair", "pause", "restructure", "sell", "close", "other"];

function dateLabel(value: string | null) {
  if (!value) return "No review date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(date);
}
function safeError() {
  return "We couldn't load or save this record. Confirm that the approved database migrations are installed for this environment and that your account has the required access.";
}

export default function ConnectedWorkspace({ user, onSignOut }: { user: User; onSignOut: () => Promise<unknown> }) {
  const [section, setSection] = useState<Section>("Overview");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfolioId, setPortfolioId] = useState("");
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioCurrency, setPortfolioCurrency] = useState("ZAR");
  const [ventureName, setVentureName] = useState("");
  const [ventureDescription, setVentureDescription] = useState("");
  const [ventureType, setVentureType] = useState("business");
  const [ventureCurrency, setVentureCurrency] = useState("ZAR");
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState("customer_interview");
  const [evidenceVenture, setEvidenceVenture] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [evidenceLimitations, setEvidenceLimitations] = useState("");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [decisionType, setDecisionType] = useState("hold");
  const [decisionRationale, setDecisionRationale] = useState("");
  const [decisionVenture, setDecisionVenture] = useState("");
  const [decisionReviewAt, setDecisionReviewAt] = useState("");

  const activePortfolio = portfolios.find((item) => item.id === portfolioId) ?? null;
  const loadPortfolios = useCallback(async () => {
    setError("");
    try {
      const items = await listPortfolios();
      setPortfolios(items);
      setPortfolioId((current) => items.some((item) => item.id === current) ? current : items[0]?.id ?? "");
    } catch {
      setError(safeError());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecords = useCallback(async (id: string) => {
    if (!id) {
      setVentures([]); setEvidence([]); setDecisions([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [ventureRows, evidenceRows, decisionRows] = await Promise.all([
        listVentures(id), listEvidence(id), listDecisions(id),
      ]);
      setVentures(ventureRows);
      setEvidence(evidenceRows);
      setDecisions(decisionRows);
    } catch {
      setError(safeError());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPortfolios(); }, [loadPortfolios]);
  useEffect(() => { void loadRecords(portfolioId); }, [portfolioId, loadRecords]);

  const dueDecisions = useMemo(() => {
    const now = Date.now();
    return decisions.filter((item) => item.status !== "completed" && item.review_at && new Date(item.review_at).getTime() <= now).length;
  }, [decisions]);

  async function createPortfolioSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (portfolioName.trim().length < 2) { setError("Portfolio name must contain at least two characters."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const created = await createPortfolio(portfolioName, portfolioCurrency, user);
      setPortfolios((current) => [created, ...current]);
      setPortfolioId(created.id);
      setPortfolioName("");
      setNotice("Portfolio created. It is now available in your workspace.");
    } catch { setError(safeError()); }
    finally { setSaving(false); }
  }

  async function createVentureSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!portfolioId || ventureName.trim().length < 2) { setError("Choose a portfolio and enter a venture name."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const created = await createVenture({ portfolioId, name: ventureName, description: ventureDescription, ventureType, currencyCode: ventureCurrency });
      setVentures((current) => [created, ...current]);
      setVentureName(""); setVentureDescription("");
      setNotice("Venture saved.");
    } catch { setError(safeError()); }
    finally { setSaving(false); }
  }

  async function createEvidenceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!portfolioId || evidenceTitle.trim().length < 2) { setError("Enter an evidence title."); return; }
    if (evidenceUrl.trim()) {
      try { new URL(evidenceUrl.trim()); } catch { setError("Enter a valid source URL, or leave it blank."); return; }
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const created = await createEvidence({
        portfolioId, ventureId: evidenceVenture || null, title: evidenceTitle, evidenceType,
        sourceUrl: evidenceUrl, sourceReference: evidenceReference, limitations: evidenceLimitations, user,
      });
      setEvidence((current) => [created, ...current]);
      setEvidenceTitle(""); setEvidenceUrl(""); setEvidenceReference(""); setEvidenceLimitations("");
      setNotice("Evidence record saved. It can now support a review or decision.");
    } catch { setError(safeError()); }
    finally { setSaving(false); }
  }

  async function createDecisionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!portfolioId || decisionTitle.trim().length < 2 || decisionRationale.trim().length < 5) {
      setError("Enter a decision title and a meaningful rationale.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const created = await createDecision({
        portfolioId, ventureId: decisionVenture || null, title: decisionTitle, decisionType,
        rationale: decisionRationale, reviewAt: decisionReviewAt ? new Date(decisionReviewAt).toISOString() : null, user,
      });
      setDecisions((current) => [created, ...current]);
      setDecisionTitle(""); setDecisionRationale(""); setDecisionReviewAt("");
      setNotice("Decision record saved with its rationale and review date.");
    } catch { setError(safeError()); }
    finally { setSaving(false); }
  }

  const displayName = user.user_metadata?.display_name || user.email || "Workspace member";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setSection("Overview")} aria-label="DAWG 360 home">
          <span className="brand-mark">D</span><span className="brand-copy"><strong>DAWG 360°</strong><small>VENTURE PORTFOLIO</small></span>
        </a>
        <label className="workspace-picker-label" htmlFor="portfolio-picker">PORTFOLIO WORKSPACE</label>
        <div className="workspace-switcher connected-switcher">
          <span className="workspace-avatar">{activePortfolio?.name.slice(0, 2).toUpperCase() || "—"}</span>
          <select id="portfolio-picker" aria-label="Select portfolio" value={portfolioId} onChange={(event) => setPortfolioId(event.target.value)} disabled={!portfolios.length}>
            {portfolios.length ? portfolios.map((portfolio) => <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>) : <option value="">No portfolio yet</option>}
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {nav.map(({ label, icon: Icon, note }) => (
            <button key={label} className={`nav-item ${section === label ? "active" : ""}`} onClick={() => setSection(label)} aria-current={section === label ? "page" : undefined} title={note}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note"><span className="note-icon"><ShieldCheck size={17} /></span><div><strong>Evidence before scale</strong><p>Material decisions remain traceable.</p></div></div>
        <button className="nav-item muted-nav" onClick={() => setSection("Evidence & decisions")}><CircleHelp size={17} /><span>Help & principles</span></button>
        <div className="profile-row connected-profile"><span className="profile-avatar">{initial}</span><span className="profile-copy"><strong>{displayName}</strong><small>Authenticated workspace</small></span><button className="signout-button" aria-label="Sign out" onClick={() => void onSignOut()}><LogOut size={15} /></button></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>{activePortfolio?.name || "Portfolio setup"}</span><span className="crumb-slash">/</span><strong>{section}</strong></div>
          <div className="top-actions"><span className="environment-chip"><span className="environment-dot" /> AUTHENTICATED</span><span className="user-email">{user.email}</span></div>
        </header>

        <section className="page-content">
          <div className="welcome-line"><span className="eyebrow">{section.toUpperCase()}</span><span className="date-note">PRIVATE WORKSPACE <span>·</span> SOURCE-LED</span></div>
          <div className="hero-row"><div className="hero-copy"><h1>{section === "Overview" ? "Build deliberately. Allocate attention wisely." : section === "Ventures" ? "Every venture has a stage and a reason." : section === "Evidence & decisions" ? "Keep the evidence behind every important call." : section === "Acquisition" ? "Make customer acquisition measurable." : section === "Finance" ? "Separate cash, cost and commitment." : "Make execution visible and accountable."}</h1><p className="hero-description">{activePortfolio ? `Records below are loaded from the selected portfolio: ${activePortfolio.name}.` : "Create a portfolio workspace before recording ventures or decisions."}</p></div><span className="readiness-status">LIVE DATA MODE</span></div>

          {error && <p className="form-error page-alert" role="alert">{error}</p>}
          {notice && <p className="form-success page-alert" role="status">{notice}</p>}

          {!portfolios.length && !loading ? (
            <section className="surface setup-surface">
              <span className="section-kicker">PORTFOLIO SETUP</span><h2>Create your first portfolio</h2>
              <p>A portfolio is a management grouping. Legal entities and ventures remain separate records.</p>
              <form className="record-form record-form-grid" onSubmit={createPortfolioSubmit}>
                <label>Portfolio name<input value={portfolioName} onChange={(event) => setPortfolioName(event.target.value)} maxLength={120} minLength={2} required placeholder="e.g. Orion Ventures" /></label>
                <label>Base currency<select value={portfolioCurrency} onChange={(event) => setPortfolioCurrency(event.target.value)}><option value="ZAR">ZAR · South African rand</option><option value="USD">USD · US dollar</option><option value="EUR">EUR · Euro</option><option value="GBP">GBP · Pound sterling</option></select></label>
                <button className="primary-button" disabled={saving}>{saving ? "Creating…" : "Create portfolio"} <ArrowRight size={15} /></button>
              </form>
            </section>
          ) : null}

          {loading && <div className="surface loading-surface" role="status">Loading records from the selected portfolio…</div>}

          {activePortfolio && !loading && section === "Overview" && (
            <>
              <div className="section-heading"><div><h2>Portfolio at a glance</h2><p>Counts are calculated from accessible records in this portfolio.</p></div><button className="text-button" onClick={() => setSection("Ventures")}>Open venture registry <ArrowUpRight size={15} /></button></div>
              <div className="metric-grid">
                <Metric label="Active ventures" value={String(ventures.filter((venture) => venture.status === "active").length)} detail="Persisted venture records" icon={BriefcaseBusiness} />
                <Metric label="Evidence items" value={String(evidence.length)} detail="Source-linked records" icon={FileText} />
                <Metric label="Decisions due" value={String(dueDecisions)} detail="Past-due review dates" icon={CheckCircle2} />
                <Metric label="Cash position" value="Not connected" detail="No financial ledger configured" icon={Wallet} />
              </div>
              <div className="content-grid">
                <section className="surface priority-surface"><div className="surface-heading"><div><span className="section-kicker">VENTURE REGISTER</span><h2>Recent ventures</h2></div><button className="text-button" onClick={() => setSection("Ventures")}>View all <ArrowUpRight size={14} /></button></div>
                  {ventures.length ? <div className="record-list">{ventures.slice(0, 5).map((venture) => <RecordRow key={venture.id} title={venture.name} meta={stages[venture.lifecycle_stage] || venture.lifecycle_stage} detail={venture.status} />)}</div> : <Empty message="No ventures have been recorded in this portfolio yet." />}
                </section>
                <section className="surface principles-surface"><div className="surface-heading"><div><span className="section-kicker">DECISION TRAIL</span><h2>Recent decisions</h2></div></div>
                  {decisions.length ? <div className="record-list">{decisions.slice(0, 4).map((decision) => <RecordRow key={decision.id} title={decision.title} meta={decision.decision_type} detail={decision.status} />)}</div> : <Empty message="No decisions have been recorded yet." />}
                </section>
              </div>
            </>
          )}

          {activePortfolio && !loading && section === "Ventures" && (
            <div className="connected-columns">
              <section className="surface"><div className="surface-heading"><div><span className="section-kicker">REGISTER</span><h2>Record a venture</h2></div></div>
                <form className="record-form" onSubmit={createVentureSubmit}>
                  <label>Venture name<input value={ventureName} onChange={(event) => setVentureName(event.target.value)} maxLength={160} minLength={2} required placeholder="Name of venture" /></label>
                  <label>Type<select value={ventureType} onChange={(event) => setVentureType(event.target.value)}><option value="idea">Idea</option><option value="business">Business</option><option value="brand">Brand</option><option value="product">Product</option><option value="project">Project</option><option value="investment">Investment</option></select></label>
                  <label>Description<textarea value={ventureDescription} onChange={(event) => setVentureDescription(event.target.value)} maxLength={10000} rows={3} placeholder="Problem, audience, offer or current constraints" /></label>
                  <label>Reporting currency<select value={ventureCurrency} onChange={(event) => setVentureCurrency(event.target.value)}><option value="ZAR">ZAR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></label>
                  <button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save venture"} <ArrowRight size={15} /></button>
                </form>
              </section>
              <section className="surface"><div className="surface-heading"><div><span className="section-kicker">CURRENT RECORDS</span><h2>Ventures ({ventures.length})</h2></div></div>
                {ventures.length ? <div className="record-list">{ventures.map((venture) => <article className="venture-record" key={venture.id}><div className="record-row-main"><strong>{venture.name}</strong><span className="quiet-tag">{venture.venture_type}</span></div><p>{venture.description || "No description recorded."}</p><div className="record-meta"><span>{stages[venture.lifecycle_stage] || venture.lifecycle_stage}</span><span>{venture.status}</span><span>{venture.currency_code}</span></div></article>)}</div> : <Empty message="Your venture register is empty. Add the first venture when you're ready." />}
              </section>
            </div>
          )}

          {activePortfolio && !loading && section === "Evidence & decisions" && (
            <div className="connected-columns">
              <section className="surface"><div className="surface-heading"><div><span className="section-kicker">SOURCE REGISTER</span><h2>Add evidence</h2></div></div>
                <form className="record-form" onSubmit={createEvidenceSubmit}>
                  <label>Evidence title<input value={evidenceTitle} onChange={(event) => setEvidenceTitle(event.target.value)} maxLength={200} minLength={2} required placeholder="What did you observe or verify?" /></label>
                  <label>Evidence type<select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value)}><option value="customer_interview">Customer interview</option><option value="experiment">Experiment</option><option value="sales_record">Sales record</option><option value="market_research">Market research</option><option value="competitor_research">Competitor research</option><option value="financial_record">Financial record</option><option value="operational_record">Operational record</option><option value="document">Document</option><option value="other">Other</option></select></label>
                  <label>Related venture<select value={evidenceVenture} onChange={(event) => setEvidenceVenture(event.target.value)}><option value="">Portfolio-level evidence</option>{ventures.map((venture) => <option key={venture.id} value={venture.id}>{venture.name}</option>)}</select></label>
                  <label>Source URL<input type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://…" maxLength={2048} /></label>
                  <label>Source reference<input value={evidenceReference} onChange={(event) => setEvidenceReference(event.target.value)} maxLength={500} placeholder="File, interview code or record reference" /></label>
                  <label>Limitations / uncertainty<textarea value={evidenceLimitations} onChange={(event) => setEvidenceLimitations(event.target.value)} maxLength={5000} rows={3} placeholder="Sample size, assumptions, missing data or limitations" /></label>
                  <button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save evidence"} <ArrowRight size={15} /></button>
                </form>
              </section>
              <section className="surface"><div className="surface-heading"><div><span className="section-kicker">EVIDENCE HISTORY</span><h2>Evidence ({evidence.length})</h2></div></div>
                {evidence.length ? <div className="record-list">{evidence.map((item) => <article className="venture-record" key={item.id}><strong>{item.title}</strong><p>{item.evidence_type.replaceAll("_", " ")}</p><div className="record-meta"><span>{dateLabel(item.collected_at)}</span>{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={12} /></a>}</div>{item.limitations && <p className="record-limitation">Limitations: {item.limitations}</p>}</article>)}</div> : <Empty message="No evidence records yet. Capture customer observations, experiments and source documents." />}
              </section>
            </div>
          )}

          {activePortfolio && !loading && section === "Operations" && (
            <div className="surface section-placeholder"><span className="section-kicker">OPERATIONS</span><h2>Operating workflows are next.</h2><p>The first data-backed slice covers portfolios, ventures, evidence and decisions. Tasks, SOPs, contracts, obligations and incidents will follow with the same access and audit controls.</p><div className="placeholder-checklist"><span><CheckCircle2 size={15} /> Authentication and portfolio isolation foundation</span><span><CheckCircle2 size={15} /> Evidence and decision record model</span><span><Activity size={15} /> Operational workflows pending</span></div></div>
          )}

          {activePortfolio && !loading && section === "Acquisition" && (
            <div className="surface section-placeholder"><span className="section-kicker">CUSTOMER ACQUISITION</span><h2>Build the funnel on verified outcomes.</h2><p>Lead, campaign, conversion and retention tables are not enabled in this first slice. No prospects or conversion metrics are being fabricated.</p><div className="placeholder-checklist"><span><CheckCircle2 size={15} /> Segment and offer requirements defined</span><span><Activity size={15} /> Acquisition tables and permissions pending</span></div></div>
          )}

          {activePortfolio && !loading && section === "Finance" && (
            <div className="surface section-placeholder"><span className="section-kicker">FINANCIAL CONTROL</span><h2>Financial records are not enabled yet.</h2><p>Do not use this workspace for live bookkeeping. A ledger, account model, reconciliation controls and financial permission tests must be implemented before recording real financial data.</p><div className="placeholder-checklist"><span><CheckCircle2 size={15} /> Currency and financial control requirements defined</span><span><Activity size={15} /> Ledger and reconciliation workflow pending</span></div></div>
          )}

          {activePortfolio && !loading && section === "Evidence & decisions" && (
            <section className="surface decision-surface"><div className="surface-heading"><div><span className="section-kicker">DECISION LOG</span><h2>Record a decision</h2></div></div>
              <form className="record-form record-form-grid" onSubmit={createDecisionSubmit}>
                <label>Decision title<input value={decisionTitle} onChange={(event) => setDecisionTitle(event.target.value)} maxLength={200} minLength={2} required placeholder="Decision to be made or reviewed" /></label>
                <label>Related venture<select value={decisionVenture} onChange={(event) => setDecisionVenture(event.target.value)}><option value="">Portfolio-level decision</option>{ventures.map((venture) => <option key={venture.id} value={venture.id}>{venture.name}</option>)}</select></label>
                <label>Decision category<select value={decisionType} onChange={(event) => setDecisionType(event.target.value)}>{decisionTypes.map((item) => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}</select></label>
                <label>Next review date<input type="date" value={decisionReviewAt} onChange={(event) => setDecisionReviewAt(event.target.value)} /></label>
                <label className="full-field">Rationale<textarea value={decisionRationale} onChange={(event) => setDecisionRationale(event.target.value)} maxLength={10000} minLength={5} rows={4} required placeholder="Evidence, alternatives, assumptions and why this decision is appropriate" /></label>
                <button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save decision"} <ArrowRight size={15} /></button>
              </form>
              <div className="section-heading decision-list-heading"><div><h2>Decision history ({decisions.length})</h2><p>Every record keeps its rationale and review date.</p></div></div>
              {decisions.length ? <div className="record-list">{decisions.map((decision) => <article className="venture-record" key={decision.id}><div className="record-row-main"><strong>{decision.title}</strong><span className="quiet-tag">{decision.status}</span></div><p>{decision.rationale}</p><div className="record-meta"><span>{decision.decision_type}</span><span>{dateLabel(decision.review_at)}</span></div></article>)}</div> : <Empty message="No decisions recorded yet." />}
            </section>
          )}
          <footer className="page-footer"><span>DAWG 360° <span className="footer-dot">·</span> Portfolio operating system</span><span><ShieldCheck size={13} /> Access enforced by database policies</span></footer>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Gauge }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={17} /></span></div><strong className="metric-value">{value}</strong><span className="metric-detail">{detail}</span></article>;
}
function Empty({ message }: { message: string }) {
  return <div className="connected-empty"><div className="empty-illustration"><FileText size={21} /></div><p>{message}</p></div>;
}
function RecordRow({ title, meta, detail }: { title: string; meta: string; detail: string }) {
  return <article className="record-row"><div><strong>{title}</strong><p>{meta}</p></div><span className="quiet-tag">{detail}</span></article>;
}
