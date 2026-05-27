export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  const styles = {
    info: { box: 'border-sky-200 bg-sky-50 text-sky-900', mark: 'i', aria: 'status' },
    error: { box: 'border-red-200 bg-red-50 text-red-900', mark: '!', aria: 'alert' },
    success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', mark: '✓', aria: 'status' },
    warning: { box: 'border-amber-200 bg-amber-50 text-amber-950', mark: '!', aria: 'alert' }
  };
  const selected = styles[type] || styles.info;
  return (
    <div role={selected.aria} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${selected.box}`}>
      <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300/70 text-xs font-bold" aria-hidden="true">{selected.mark}</span>
      <span className="leading-5">{children}</span>
    </div>
  );
}
