import { CheckCircle2, FolderKanban, ListChecks, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  const highlights = [
    { icon: FolderKanban, label: "Project workspaces" },
    { icon: ListChecks, label: "Task ownership" },
    { icon: ShieldCheck, label: "Role-based access" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between bg-slate-950 p-8 text-white sm:p-10">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-white text-slate-950">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="mt-10 max-w-xl">
              <p className="text-sm font-semibold uppercase text-emerald-300">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <Icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-100">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
