import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { JOB_ROLES } from "@/lib/job-roles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SkillMatch AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = (data.user?.user_metadata as { full_name?: string } | undefined)?.full_name
        || data.user?.email?.split("@")[0] || "there";
      setName(n);
    });
  }, []);

  function proceed() {
    const role = isCustom ? custom.trim() : selected;
    if (!role) {
      toast.error("Please select or enter a job role to continue.");
      return;
    }
    navigate({ to: "/upload", search: { role } });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Hi {name} 👋</h1>
          <p className="mt-2 text-muted-foreground">Let's get your resume analyzed. First — what role are you targeting?</p>
        </motion.div>

        <Card className="mt-8 border-border/60 shadow-card">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">What job role are you applying for?</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll tailor the analysis to this role.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {JOB_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setIsCustom(false); setSelected(r); }}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/60 ${
                    !isCustom && selected === r ? "border-primary bg-primary/5 shadow-elegant" : "border-border bg-card"
                  }`}
                  aria-pressed={!isCustom && selected === r}
                >
                  <div className={`grid size-9 place-items-center rounded-lg ${!isCustom && selected === r ? "gradient-brand text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    <Briefcase className="size-4" />
                  </div>
                  <span className="text-sm font-medium">{r}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setIsCustom(true); setSelected(null); }}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/60 ${
                  isCustom ? "border-primary bg-primary/5 shadow-elegant" : "border-border bg-card"
                }`}
                aria-pressed={isCustom}
              >
                <div className={`grid size-9 place-items-center rounded-lg ${isCustom ? "gradient-brand text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <Briefcase className="size-4" />
                </div>
                <span className="text-sm font-medium">Custom role</span>
              </button>
            </div>

            {isCustom && (
              <div className="mt-5 space-y-1.5">
                <Label htmlFor="custom-role">Enter your target role</Label>
                <Input id="custom-role" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Senior Product Designer" />
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button onClick={proceed} disabled={!(isCustom ? custom.trim() : selected)} className="gradient-brand text-primary-foreground border-0 shadow-elegant hover:opacity-95">
                Continue <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
