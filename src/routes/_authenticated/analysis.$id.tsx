import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowLeft, Brain, Check, CheckCircle2, Copy, FileWarning,
  Gauge, Lightbulb, Loader2, PenLine, Sparkles, Target, X, ShieldCheck, TrendingUp,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/SiteHeader";
import { ScoreRing, ReportCard } from "@/components/report/ScoreRing";
import { getAnalysis, runAnalysis } from "@/lib/analysis.functions";
import type { ResumeReport } from "@/lib/report-types";

export const Route = createFileRoute("/_authenticated/analysis/$id")({
  head: () => ({ meta: [{ title: "Resume report — SkillMatch AI" }] }),
  component: AnalysisPage,
});

function AnalysisPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getAnalysis);
  const run = useServerFn(runAnalysis);
  const [retrying, setRetrying] = useState(false);

  const q = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => get({ data: { id } }),
    refetchInterval: (query) => {
      const s = (query.state.data as { status?: string } | undefined)?.status;
      return s === "complete" || s === "error" ? false : 2000;
    },
  });

  async function retry() {
    setRetrying(true);
    try {
      await run({ data: { id } });
      toast.success("Analysis restarted");
      q.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to restart");
    } finally { setRetrying(false); }
  }

  if (q.isLoading) {
    return (
      <PageWrap>
        <LoadingState message="Loading analysis..." />
      </PageWrap>
    );
  }

  const row = q.data;
  if (!row) return <PageWrap><LoadingState message="Loading..." /></PageWrap>;

  if (row.status === "pending" || row.status === "processing") {
    return <PageWrap><AnalyzingState role={row.job_role} fileName={row.file_name} /></PageWrap>;
  }

  if (row.status === "error") {
    return (
      <PageWrap>
        <div className="mx-auto max-w-xl rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="mx-auto size-10 text-destructive" />
          <h2 className="mt-4 font-display text-xl font-semibold">Analysis failed</h2>
          <p className="mt-2 text-sm text-muted-foreground">{row.error || "Something went wrong."}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={retry} disabled={retrying}>
              {retrying && <Loader2 className="size-4 animate-spin" />} Try again
            </Button>
            <Button variant="outline" asChild><Link to="/dashboard">Back to dashboard</Link></Button>
          </div>
        </div>
      </PageWrap>
    );
  }

  const report = row.report as unknown as ResumeReport | null;
  if (!report) return <PageWrap><LoadingState message="Preparing report..." /></PageWrap>;

  return <PageWrap><Report report={report} role={row.job_role} fileName={row.file_name} /></PageWrap>;
}

function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="text-center">
        <Loader2 className="mx-auto size-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function AnalyzingState({ role, fileName }: { role: string; fileName: string }) {
  const [stepIdx, setStepIdx] = useState(0);
  const steps = useMemo(() => [
    "Extracting text from your resume...",
    "Identifying skills, education, and experience...",
    `Comparing against ${role} requirements...`,
    "Running ATS compatibility checks...",
    "Generating personalized improvements...",
    "Finalizing your report...",
  ], [role]);
  useEffect(() => {
    const t = setInterval(() => setStepIdx((i) => Math.min(i + 1, steps.length - 1)), 3500);
    return () => clearInterval(t);
  }, [steps.length]);
  const pct = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-elegant">
        <Sparkles className="size-7" />
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold">Analyzing your resume</h2>
      <p className="mt-2 text-sm text-muted-foreground">{fileName} → {role}</p>
      <div className="mx-auto mt-8 max-w-sm">
        <Progress value={pct} />
      </div>
      <motion.p
        key={stepIdx}
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-sm text-foreground"
      >{steps[stepIdx]}</motion.p>
    </div>
  );
}

function Report({ report, role, fileName }: { report: ResumeReport; role: string; fileName: string }) {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" asChild className="-ml-2 mb-2"><Link to="/dashboard"><ArrowLeft className="size-4" /> Dashboard</Link></Button>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Your resume report</h1>
          <p className="mt-1 text-sm text-muted-foreground">{fileName} → <span className="font-medium text-foreground">{role}</span></p>
        </div>
        <Button onClick={() => window.print()} variant="outline">Print / Save PDF</Button>
      </div>

      {/* Top summary row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ReportCard title="Overall Score" icon={Gauge}>
            <div className="flex flex-col items-center">
              <ScoreRing value={report.scores.overall} label="out of 100" />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {report.feedback.interviewReady ? "Interview-ready" : "Needs improvement"}
              </p>
            </div>
          </ReportCard>
        </div>
        <div className="lg:col-span-2">
          <ReportCard title="Score Breakdown" icon={TrendingUp}>
            <div className="space-y-4">
              {[
                ["Formatting", report.scores.formatting],
                ["Skills", report.scores.skills],
                ["Experience", report.scores.experience],
                ["Education", report.scores.education],
                ["ATS Compatibility", report.scores.ats],
              ].map(([label, v]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{v}/100</span>
                  </div>
                  <Progress value={v as number} />
                </div>
              ))}
            </div>
          </ReportCard>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feedback" className="mt-8">
        <TabsList className="flex w-full flex-wrap h-auto gap-1 bg-muted/40">
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="ats">ATS</TabsTrigger>
          <TabsTrigger value="skills">Skill Gap</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="improve">Improvements</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="mt-6 grid gap-6 lg:grid-cols-2">
          <ReportCard title="Strengths" icon={CheckCircle2}>
            <ul className="space-y-2">{report.feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-success" /> {s}</li>
            ))}</ul>
          </ReportCard>
          <ReportCard title="Weaknesses" icon={FileWarning}>
            <ul className="space-y-2">{report.feedback.weaknesses.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> {s}</li>
            ))}</ul>
          </ReportCard>
          <div className="lg:col-span-2">
            <ReportCard title="Recruiter Perspective" icon={Brain}>
              <p className="text-sm leading-relaxed">{report.feedback.recruiterPerspective}</p>
              <div className="mt-4">
                <Badge variant={report.feedback.interviewReady ? "default" : "secondary"}>
                  {report.feedback.interviewReady ? "✓ Interview-ready" : "Needs work before submitting"}
                </Badge>
              </div>
            </ReportCard>
          </div>
        </TabsContent>

        <TabsContent value="ats" className="mt-6 grid gap-6 lg:grid-cols-3">
          <ReportCard title="ATS Score" icon={ShieldCheck}>
            <div className="flex flex-col items-center">
              <ScoreRing value={report.ats.score} size={150} stroke={12} label="ATS" />
            </div>
          </ReportCard>
          <div className="lg:col-span-2 grid gap-6">
            <ReportCard title="Missing Keywords">
              <div className="flex flex-wrap gap-2">
                {report.ats.missingKeywords.length === 0 ? <p className="text-sm text-muted-foreground">None — great keyword coverage.</p> :
                  report.ats.missingKeywords.map((k) => <Badge key={k} variant="outline" className="border-warning/50 text-warning-foreground bg-warning/10">{k}</Badge>)}
              </div>
            </ReportCard>
            <ReportCard title="Issues & Recommendations" icon={Lightbulb}>
              {report.ats.issues.length > 0 && (
                <>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Issues</p>
                  <ul className="mb-4 space-y-1.5">{report.ats.issues.map((s, i) =>
                    <li key={i} className="flex gap-2 text-sm"><X className="mt-0.5 size-4 shrink-0 text-destructive" />{s}</li>)}</ul>
                </>
              )}
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommendations</p>
              <ul className="space-y-1.5">{report.ats.recommendations.map((s, i) =>
                <li key={i} className="flex gap-2 text-sm"><Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />{s}</li>)}</ul>
            </ReportCard>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-6 grid gap-6 lg:grid-cols-2">
          <ReportCard title="Skill Match" icon={Target}>
            <div className="flex flex-col items-center">
              <ScoreRing value={report.skillGap.matchPercentage} size={150} stroke={12} label="match" />
              <p className="mt-3 text-sm text-muted-foreground">Resume vs. {role} requirements</p>
            </div>
          </ReportCard>
          <ReportCard title="Skill Radar">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData(report)}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                  <Radar name="You" dataKey="you" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.35} />
                  <Radar name="Required" dataKey="required" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ReportCard>
          <div className="lg:col-span-2">
            <ReportCard title="Skills Comparison">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData(report)} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" hide domain={[0, 1]} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={140} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ReportCard>
          </div>
          <ReportCard title="Existing Skills">
            <div className="flex flex-wrap gap-2">
              {report.skillGap.matchedSkills.map((s) => <Badge key={s} className="bg-success/15 text-success-foreground border border-success/30">{s}</Badge>)}
            </div>
          </ReportCard>
          <ReportCard title="Missing Skills">
            <div className="flex flex-wrap gap-2">
              {report.skillGap.missingSkills.length === 0
                ? <p className="text-sm text-muted-foreground">All required skills present 🎉</p>
                : report.skillGap.missingSkills.map((s) => <Badge key={s} variant="outline" className="border-destructive/40 text-destructive">{s}</Badge>)}
            </div>
          </ReportCard>
        </TabsContent>

        <TabsContent value="grammar" className="mt-6 grid gap-6 lg:grid-cols-3">
          <ReportCard title="Writing Quality" icon={PenLine}>
            <div className="flex flex-col items-center">
              <ScoreRing value={report.grammar.writingScore} size={150} stroke={12} label="quality" />
            </div>
          </ReportCard>
          <div className="lg:col-span-2 grid gap-6">
            <ReportCard title="Issues found">
              {report.grammar.issues.length === 0 ? <p className="text-sm text-muted-foreground">No major grammar issues found.</p> :
                <ul className="space-y-1.5">{report.grammar.issues.map((s, i) =>
                  <li key={i} className="flex gap-2 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />{s}</li>)}</ul>}
            </ReportCard>
            <ReportCard title="Suggestions">
              <ul className="space-y-1.5">{report.grammar.suggestions.map((s, i) =>
                <li key={i} className="flex gap-2 text-sm"><Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />{s}</li>)}</ul>
            </ReportCard>
            {report.grammar.examples.length > 0 && (
              <ReportCard title="Before & After">
                <div className="space-y-4">
                  {report.grammar.examples.map((ex, i) => (
                    <div key={i} className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">Before</p>{ex.before}</div>
                      <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-success">After</p>{ex.after}</div>
                    </div>
                  ))}
                </div>
              </ReportCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <ReportCard title="Section Detection">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(report.sections).map(([k, v]) => (
                <div key={k} className={`flex items-center gap-3 rounded-xl border p-4 ${v ? "border-success/40 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                  {v ? <CheckCircle2 className="size-5 text-success" /> : <X className="size-5 text-destructive" />}
                  <span className="text-sm font-medium capitalize">{k}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{v ? "Present" : "Missing"}</span>
                </div>
              ))}
            </div>
          </ReportCard>
        </TabsContent>

        <TabsContent value="improve" className="mt-6 space-y-6">
          {(["summary", "skills", "projects", "experience"] as const).map((k) => (
            <ImprovementBlock key={k} title={`${k.charAt(0).toUpperCase()}${k.slice(1)}`} pair={report.improvements[k]} />
          ))}
          <ImprovementBlock title="Professional Summary" pair={report.summaryRewrite} />
        </TabsContent>

        <TabsContent value="career" className="mt-6 grid gap-6 lg:grid-cols-3">
          <ReportCard title="Career Readiness" icon={Sparkles}>
            <div className="flex flex-col items-center">
              <ScoreRing value={report.career.readinessScore} size={150} stroke={12} sublabel={report.career.level} />
              <Badge className="mt-4 gradient-brand text-primary-foreground border-0">{report.career.level}</Badge>
            </div>
          </ReportCard>
          <div className="lg:col-span-2">
            <ReportCard title="Personalized Learning Roadmap" icon={Lightbulb}>
              <ol className="space-y-3">
                {report.career.roadmap.map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="grid size-7 shrink-0 place-items-center rounded-full gradient-brand text-xs font-semibold text-primary-foreground">{i + 1}</div>
                    <div>
                      <p className="text-sm font-medium">{r.step}</p>
                      <p className="text-xs text-muted-foreground">{r.reason}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </ReportCard>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function ImprovementBlock({ title, pair }: { title: string; pair: { original: string; improved: string } }) {
  function copy() {
    navigator.clipboard.writeText(pair.improved);
    toast.success("Copied improved version");
  }
  if (!pair?.improved) return null;
  return (
    <ReportCard title={title} icon={PenLine} action={
      <Button variant="outline" size="sm" onClick={copy}><Copy className="size-4" /> Copy</Button>
    }>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original</p>
          {pair.original || <span className="italic text-muted-foreground">Empty</span>}
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm whitespace-pre-wrap">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">AI Improved</p>
          {pair.improved}
        </div>
      </div>
    </ReportCard>
  );
}

function radarData(r: ResumeReport) {
  const req = r.skillGap.requiredSkills.slice(0, 6);
  const have = new Set(r.skillGap.matchedSkills.map((s) => s.toLowerCase()));
  return req.map((skill) => ({
    skill,
    you: have.has(skill.toLowerCase()) ? 100 : 25,
    required: 100,
  }));
}

function barData(r: ResumeReport) {
  const req = r.skillGap.requiredSkills.slice(0, 8);
  const have = new Set(r.skillGap.matchedSkills.map((s) => s.toLowerCase()));
  return req.map((s) => ({ name: s, value: have.has(s.toLowerCase()) ? 1 : 0.15 }));
}
