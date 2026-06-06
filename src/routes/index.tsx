import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Target,
  PenLine,
  FileText,
  Brain,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillMatch AI — Land more interviews with an AI-scored resume" },
      { name: "description", content: "Upload your resume and get a full AI report: score, ATS check, skill-gap analysis, grammar review, and personalized rewrites for your target job role." },
      { property: "og:title", content: "SkillMatch AI — AI Resume Analyzer" },
      { property: "og:description", content: "Get an instant AI resume score and personalized improvement plan." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Gauge, title: "Resume Score", desc: "Get scored on formatting, skills, experience, education, and ATS readiness — out of 100." },
  { icon: ShieldCheck, title: "ATS Analysis", desc: "See exactly which keywords, sections, and structural issues are tanking your applications." },
  { icon: Target, title: "Skill Gap Analysis", desc: "Compare your skills against your target job role with radar and bar visualizations." },
  { icon: PenLine, title: "Resume Improvement", desc: "AI-rewritten summary, projects, and experience bullets — side by side with your originals." },
  { icon: Brain, title: "Grammar & Writing", desc: "Catch weak verbs, repetitions, and readability issues with before/after examples." },
  { icon: FileText, title: "Section Detection", desc: "Visual checklist of every recruiter-expected section, with what's present and what's missing." },
  { icon: Sparkles, title: "Career Readiness", desc: "Know where you stand — Beginner, Developing, Job Ready, or Competitive — with a roadmap." },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Cloud Engineer", quote: "Doubled my interview callbacks in two weeks. The skill-gap radar told me exactly what to learn next." },
  { name: "Marcus T.", role: "Data Analyst", quote: "The ATS analysis caught keyword issues I'd missed for months. Worth its weight in gold." },
  { name: "Aisha L.", role: "DevOps Engineer", quote: "The recruiter perspective is brutally honest in the best way. Finally fixed my summary." },
];

const FAQS = [
  { q: "What file types are supported?", a: "PDF and DOCX, up to 5 MB. Your resume is parsed securely server-side." },
  { q: "Is my data private?", a: "Yes. Resumes are stored privately and only accessible to you. We never share them." },
  { q: "How accurate is the AI scoring?", a: "We use Google Gemini grounded in real recruiter heuristics and the requirements of your target role." },
  { q: "Can I analyze multiple resumes?", a: "Absolutely — every analysis is saved to your dashboard and you can re-run as needed." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Powered by Gemini AI
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Land more interviews with an{" "}
              <span className="text-gradient-brand">AI-scored resume</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Upload your resume, pick your target role, and get a full professional report —
              score, ATS analysis, skill gaps, rewrites, and a personalized roadmap.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="gradient-brand text-primary-foreground border-0 shadow-elegant hover:opacity-95">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Analyze Resume <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Get Started — Free</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-primary" /> Results in 30 seconds</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-primary" /> Private & secure</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything you need to stand out</h2>
            <p className="mt-4 text-muted-foreground">A complete resume audit, built for the role you actually want.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="group h-full border-border/60 transition-all hover:border-primary/40 hover:shadow-elegant">
                  <CardContent className="p-6">
                    <div className="mb-4 grid size-11 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-elegant">
                      <f.icon className="size-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-border/60 bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Loved by job seekers worldwide</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-border/60 shadow-card">
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-0.5 text-warning">
                    {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="size-4 fill-current" />)}
                  </div>
                  <p className="text-sm leading-relaxed">"{t.quote}"</p>
                  <div className="mt-5 border-t border-border/60 pt-4">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/60 bg-card p-10 shadow-elegant sm:p-14">
            <h3 className="font-display text-3xl font-bold sm:text-4xl">Ready for a resume that gets interviews?</h3>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Join thousands of job seekers using SkillMatch AI to stand out.</p>
            <Button size="lg" asChild className="mt-8 gradient-brand text-primary-foreground border-0 shadow-elegant hover:opacity-95">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get my free AI report <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
