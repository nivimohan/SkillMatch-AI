import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function SiteHeader() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserEmail(s?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-lg gradient-brand text-primary-foreground shadow-elegant">
            <Sparkles className="size-4" />
          </span>
          <span>SkillMatch <span className="text-gradient-brand">AI</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild><a href="/#features">Features</a></Button>
          <Button variant="ghost" asChild><a href="/#testimonials">Testimonials</a></Button>
          <Button variant="ghost" asChild><a href="/#faq">FAQ</a></Button>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {userEmail ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="size-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
              <Button asChild className="gradient-brand text-primary-foreground border-0 shadow-elegant hover:opacity-95">
                <Link to="/auth" search={{ mode: "signup" }}>Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
