export function StudentProfilePage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Student profile</p>
      <h3 className="mt-3 text-2xl font-bold text-slate-900">Profile summary</h3>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        This panel will later present approved profile fields such as name, matric number, department,
        programme, level of enrollment, and account status in a read-only student view.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Identity</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Student name</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Academic</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Department and level</p>
        </div>
      </div>
    </section>
  );
}
