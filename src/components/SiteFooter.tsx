import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-lg font-bold">SkillMatch <span className="text-gradient-brand">AI</span></div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            AI-powered resume analysis trusted by job seekers, students, and recruiters.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="/#features" className="hover:text-foreground">Features</a></li>
            <li><Link to="/auth" className="hover:text-foreground">Analyze Resume</Link></li>
            <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#about" className="hover:text-foreground">About</a></li>
            <li><a href="mailto:hello@skillmatch.ai" className="hover:text-foreground">Contact</a></li>
            <li><a href="#privacy" className="hover:text-foreground">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Get started</h4>
          <p className="mt-3 text-sm text-muted-foreground">Upload your resume in seconds and get a full AI report.</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SkillMatch AI. All rights reserved.
      </div>
    </footer>
  );
}
