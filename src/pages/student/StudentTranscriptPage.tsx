export function StudentTranscriptPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Academic transcript</p>
      <h3 className="mt-3 text-2xl font-bold text-slate-900">Transcript preview</h3>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        This page will later show a clean academic record derived from the student’s stored results and
        related academic-session information.
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        The transcript view is intentionally left as a shell until the later result-management and
        transcript-generation phases are implemented.
      </div>
    </section>
  );
}
