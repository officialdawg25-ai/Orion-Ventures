import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PasswordRecoveryPanel({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 10) {
      setError("Use a password with at least 10 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    if (!supabase) {
      setError("Password recovery is not configured for this environment.");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSaved(true);
      setPassword("");
      setConfirmation("");
    } catch {
      setError("We couldn't update your password. Request a new recovery link and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="recovery-title">
        <a className="brand auth-brand" href="/" aria-label="Orion Ventures home">
          <span className="brand-mark">D</span>
          <span className="brand-copy"><strong>Orion Ventures</strong><small>HOLDING COMPANY OS</small></span>
        </a>
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h1 id="recovery-title">{saved ? "Password updated." : "Choose a new password."}</h1>
        <p className="auth-intro">{saved ? "Your password has been changed. Continue to your authenticated workspace." : "Use a strong password that you do not reuse for another service."}</p>
        <div className="auth-assurance"><ShieldCheck size={17} /><span>Recovery session · Privileged actions remain protected</span></div>
        {saved ? (
          <button className="primary-button" onClick={onComplete}>Continue to workspace <ArrowRight size={15} /></button>
        ) : (
          <form className="record-form auth-form" onSubmit={submit}>
            <label>New password<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required /><span className="field-hint">At least 10 characters.</span></label>
            <label>Confirm new password<input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={10} required /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={busy}><LockKeyhole size={16} /> {busy ? "Updating…" : "Update password"} <ArrowRight size={15} /></button>
          </form>
        )}
        <p className="auth-footnote">Never share a recovery link. If you did not request this change, close this page and secure your email account.</p>
      </section>
    </main>
  );
}
