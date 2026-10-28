import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import AuthPanel from "./components/AuthPanel";
import PasswordRecoveryPanel from "./components/PasswordRecoveryPanel";
import ConnectedWorkspace from "./components/ConnectedWorkspace";
import PreviewWorkspace from "./PreviewWorkspace";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    if (window.location.hash.includes("type=recovery")) setRecoveryMode(true);
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(error ? null : data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
      if (event === "SIGNED_OUT") setRecoveryMode(false);
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!supabase) return <PreviewWorkspace />;
  const client = supabase;

  if (loading) {
    return <main className="auth-shell"><section className="auth-card" aria-live="polite"><p className="eyebrow">Orion Ventures · SECURE WORKSPACE</p><h1>Preparing your workspace</h1><p>Checking your signed-in session…</p></section></main>;
  }

  if (!session?.user) return <AuthPanel />;
  if (recoveryMode) return <PasswordRecoveryPanel onComplete={() => setRecoveryMode(false)} />;

  return <ConnectedWorkspace user={session.user as User} onSignOut={() => client.auth.signOut()} />;
}
