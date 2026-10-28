import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!supabase) return;
    if (mode === "signup" && displayName.trim().length < 2) {
      setError("Enter a display name with at least two characters.");
      return;
    }
    if (mode !== "reset" && password.length < 10) {
      setError("Use a password with at least 10 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "reset") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setMessage("If an account exists for that address, a password-reset link has been sent.");
      } else if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage("Account request received. Check your email for the confirmation link before signing in.");
        } else {
          setMessage("Account created. Preparing your workspace…");
        }
      }
    } catch {
      setError("We couldn't complete that request. Check your details and try again. If the problem continues, contact the workspace administrator.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="brand auth-brand" href="/" aria-label="Orion Ventures home">
          <span className="brand-mark">D</span>
          <span className="brand-copy"><strong>Orion Ventures</strong><small>HOLDING COMPANY OS</small></span>
        </a>
        <p className="eyebrow">EVIDENCE BEFORE SCALE</p>
        <h1 id="auth-title">{mode === "signin" ? "Your portfolio, governed." : mode === "signup" ? "Create your workspace." : "Reset your password."}</h1>
        <p className="auth-intro">{mode === "signin" ? "Sign in to continue to your private venture portfolio." : mode === "signup" ? "Start with a secure account. Portfolio records remain protected by database permissions." : "Enter your email address and we will send a secure reset link if an account exists."}</p>
        <div className="auth-assurance"><ShieldCheck size={17} /><span>Secure session · Portfolio-level access controls</span></div>
        <form className="record-form auth-form" onSubmit={submit}>
          {mode === "signup" && (
            <label>Display name
              <input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={120} required />
            </label>
          )}
          <label>Email address
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
          </label>
          {mode !== "reset" && <label>Password
            <input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required />
            <span className="field-hint">At least 10 characters.</span>
          </label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}
          <button className="primary-button" type="submit" disabled={busy}>
            <LockKeyhole size={16} /> {busy ? "Please wait…" : mode === "signin" ? "Sign in securely" : mode === "signup" ? "Create account" : "Send reset link"} <ArrowRight size={15} />
          </button>
        </form>
        {mode === "signin" && <p className="auth-switch auth-forgot"><button type="button" onClick={() => { setMode("reset"); setError(""); setMessage(""); }}>Forgot password?</button></p>}
        <p className="auth-switch">
          {mode === "signin" ? "New to Orion Ventures?" : mode === "signup" ? "Already have an account?" : "Remembered your password?"}{" "}
          <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>
            {mode === "signin" ? "Create an account" : "Back to sign in"}
          </button>
        </p>
        <p className="auth-footnote">Never share your password or one-time confirmation link. Workspace access is enforced by the database, not by this screen alone.</p>
      </section>
    </main>
  );
}
