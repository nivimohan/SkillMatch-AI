import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateInput = z.object({
  jobRole: z.string().trim().min(1).max(120),
  fileName: z.string().trim().min(1).max(255),
  filePath: z.string().trim().min(1).max(512),
});

export const createAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        job_role: data.jobRole,
        file_name: data.fileName,
        file_path: data.filePath,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const runAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { extractResumeText } = await import("./resume-parser.server");
    const { analyzeResume } = await import("./ai-analyzer.server");

    const { data: row, error: fetchErr } = await supabase
      .from("analyses")
      .select("id, user_id, job_role, file_name, file_path, status")
      .eq("id", data.id)
      .single();
    if (fetchErr || !row) throw new Error("Analysis not found");
    if (row.user_id !== userId) throw new Error("Forbidden");
    if (row.status === "complete" && (row as { report?: unknown }).report) {
      return { ok: true, id: data.id };
    }

    await supabaseAdmin.from("analyses").update({ status: "processing", error: null }).eq("id", data.id);

    try {
      const { data: file, error: dlErr } = await supabaseAdmin.storage
        .from("resumes")
        .download(row.file_path);
      if (dlErr || !file) throw new Error(dlErr?.message ?? "Failed to download resume");
      const buf = new Uint8Array(await file.arrayBuffer());
      const text = await extractResumeText(row.file_name, buf);
      if (!text || text.length < 50) throw new Error("Could not extract enough text from resume.");

      const report = await analyzeResume(text, row.job_role);

      await supabaseAdmin
        .from("analyses")
        .update({ status: "complete", resume_text: text.slice(0, 20000), report })
        .eq("id", data.id);
      return { ok: true, id: data.id };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      await supabaseAdmin.from("analyses").update({ status: "error", error: msg }).eq("id", data.id);
      throw new Error(msg);
    }
  });

export const getAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("analyses")
      .select("id, job_role, file_name, status, report, error, created_at")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error("Analysis not found");
    return row;
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("analyses")
      .select("id, job_role, file_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
