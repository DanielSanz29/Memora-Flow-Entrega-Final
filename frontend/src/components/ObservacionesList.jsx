export default function ObservacionesList({ observaciones = [] }) {
  return (
    <div className="space-y-3">
      {observaciones.length === 0 && <p className="text-sm text-slate-500">Todavía no hay observaciones internas.</p>}
      {observaciones.map((observacion) => (
        <article key={observacion.id} className="surface-muted p-3">
          <p className="text-sm text-slate-800">{observacion.texto}</p>
          <p className="mt-2 text-xs text-slate-500">{observacion.usuario} · {new Date(observacion.fecha_creacion).toLocaleString('es-ES')}</p>
        </article>
      ))}
    </div>
  );
}
