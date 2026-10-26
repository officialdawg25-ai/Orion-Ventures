import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import AuthPanel from "./components/AuthPanel";
import ConnectedWorkspace from "./components/ConnectedWorkspace";
import PreviewWorkspace from "./PreviewWorkspace";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(error ? null : data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!supabase) return <PreviewWorkspace />;

  if (loading) {
    return <main className="auth-shell"><section className="auth-card" aria-live="polite"><p className="eyebrow">DAWG 360° · SECURE WORKSPACE</p><h1>Preparing your workspace</h1><p>Checking your signed-in session…</p></section></main>;
  }

  if (!session?.user) return <AuthPanel />;

  return <ConnectedWorkspace user={session.user as User} onSignOut={() => supabase.auth.signOut()} />;
}
