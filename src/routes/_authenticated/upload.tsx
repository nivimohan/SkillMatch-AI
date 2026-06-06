import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { z } from "zod";
import { toast } from "sonner";
import { UploadCloud, FileText, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createAnalysis, runAnalysis } from "@/lib/analysis.functions";

const MAX_BYTES = 5 * 1024 * 1024;
const search = z.object({ role: z.string().min(1) });

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({ meta: [{ title: "Upload resume — SkillMatch AI" }] }),
  validateSearch: (s) => search.parse(s),
  component: Upload,
});

function Upload() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();
  const create = useServerFn(createAnalysis);
  const run = useServerFn(runAnalysis);

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "queued" | "analyzing">("idle");

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length) {
      const err = rejected[0].errors[0];
      toast.error(err.code === "file-too-large" ? "File is too large. Max 5 MB." : "Only PDF and DOCX files are supported.");
      return;
    }
    setFile(accepted[0] ?? null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: MAX_BYTES,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  async function start() {
    if (!file) { toast.error("Please upload a resume first."); return; }
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) { toast.error("Session expired. Sign in again."); return; }

    setPhase("uploading");
    setProgress(10);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;

    const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) { toast.error(upErr.message); setPhase("idle"); setProgress(0); return; }
    setProgress(45);

    try {
      setPhase("queued");
      const { id } = await create({ data: { jobRole: role, fileName: file.name, filePath: path } });
      setProgress(60);
      setPhase("analyzing");
      navigate({ to: "/analysis/$id", params: { id } });
      // fire-and-forget run; report page will poll
      run({ data: { id } }).catch(() => { /* report page surfaces error */ });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start analysis");
      setPhase("idle");
      setProgress(0);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-4 -ml-2">
          <Link to="/dashboard"><ArrowLeft className="size-4" /> Back</Link>
        </Button>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Upload your resume</h1>
        <p className="mt-2 text-muted-foreground">
          Target role: <span className="font-medium text-foreground">{role}</span>
        </p>

        <Card className="mt-8 border-border/60 shadow-card">
          <CardContent className="p-6 sm:p-8">
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/30"
              }`}
            >
              <input {...getInputProps()} />
              <div className="grid size-14 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-elegant">
                <UploadCloud className="size-6" />
              </div>
              <p className="mt-4 font-medium">
                {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse — PDF or DOCX, up to 5 MB</p>
            </div>

            {file && (
              <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-secondary"><FileText className="size-5" /></div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <CheckCircle2 className="size-5 text-success" />
              </div>
            )}

            {phase !== "idle" && (
              <div className="mt-5 space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">
                  {phase === "uploading" && "Uploading resume..."}
                  {phase === "queued" && "Preparing analysis..."}
                  {phase === "analyzing" && "Redirecting to results..."}
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                onClick={start}
                disabled={!file || phase !== "idle"}
                className="gradient-brand text-primary-foreground border-0 shadow-elegant hover:opacity-95"
              >
                {phase !== "idle" && <Loader2 className="size-4 animate-spin" />}
                Analyze my resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
