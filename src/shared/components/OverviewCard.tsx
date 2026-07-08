export function OverviewCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-3xl font-semibold text-slate-950">{value}</strong>
        <span className={`h-2.5 w-16 rounded-full ${accent}`} />
      </div>
    </div>
  )
}
