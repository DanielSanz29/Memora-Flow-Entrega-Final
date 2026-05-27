export default function FormField({ label, children, help, required = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
      </span>
      {children}
      {help && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{help}</span>}
    </label>
  );
}
export const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#456265] focus:ring-2 focus:ring-[#d4dfdc] disabled:cursor-not-allowed disabled:bg-slate-100';
