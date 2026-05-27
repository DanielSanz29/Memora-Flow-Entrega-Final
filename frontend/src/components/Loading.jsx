export default function Loading({ text = 'Cargando información...' }) {
  return (
    <div className="surface flex items-center gap-3 p-6 text-sm text-slate-600" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#314b4c]" aria-hidden="true" />
      {text}
    </div>
  );
}
