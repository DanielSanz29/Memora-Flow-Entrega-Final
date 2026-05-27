"""Pruebas funcionales reproducibles de Memora Flow en modo DB_MODE=memory.

Uso desde la raiz del proyecto, con el backend iniciado en otra terminal:
  Windows PowerShell: $env:API_BASE="http://127.0.0.1:3100/api"; python scripts/ejecutar_pruebas_demo.py
  Linux/macOS:        API_BASE="http://127.0.0.1:3100/api" python scripts/ejecutar_pruebas_demo.py
"""
import json
import os
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

BASE = os.getenv("API_BASE", "http://127.0.0.1:3100/api")
ROOT = Path(__file__).resolve().parents[1]
OUTDIR = ROOT / "docs" / "evidencias"
OUTDIR.mkdir(parents=True, exist_ok=True)
records = []
tokens = {}


def call(method, path, body=None, token=None, pdf=False):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"} if body is not None else {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            raw, status = res.read(), res.status
            ctype = res.headers.get("Content-Type", "")
    except urllib.error.HTTPError as err:
        raw, status = err.read(), err.code
        ctype = err.headers.get("Content-Type", "")
    if pdf or "application/pdf" in ctype:
        return status, raw, ctype
    try:
        payload = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError:
        payload = {"raw": raw.decode("utf-8", errors="replace")}
    return status, payload, ctype


def check(code, requisito, desc, got, expected, ok, evidence):
    records.append({
        "id": code, "requisito": requisito, "prueba": desc,
        "resultado_obtenido": got, "esperado": expected,
        "estado": "SUPERADA" if ok else "NO SUPERADA", "evidencia": evidence,
    })


s, j, _ = call("POST", "/auth/login", {"email": "admin@memora.local", "password": "Admin1234"})
tokens["admin"] = j.get("token") if isinstance(j, dict) else None
check("CP-01", "RF-01", "Inicio de sesión válido", f"HTTP {s}; token emitido={bool(tokens['admin'])}", "HTTP 200 y token JWT", s == 200 and bool(tokens["admin"]), "respuesta JSON registrada")

s, j, _ = call("POST", "/auth/login", {"email": "admin@memora.local", "password": "incorrecta"})
check("CP-02", "RF-01", "Contraseña incorrecta", f"HTTP {s}; {j.get('message', '')}", "HTTP 401", s == 401, "respuesta JSON registrada")

s, j, _ = call("GET", "/ordenes/1/resumen")
check("CP-03", "RNF-04", "Ruta protegida sin token", f"HTTP {s}; {j.get('message', '')}", "HTTP 401", s == 401, "respuesta JSON registrada")

s, j, _ = call("POST", "/auth/login", {"email": "recepcion@memora.local", "password": "Recep1234"})
tokens["recepcion"] = j.get("token")
s, j, _ = call("GET", "/admin/usuarios", token=tokens["recepcion"])
check("CP-04", "RF-01 / RNF-04", "Control de rol en administración", f"HTTP {s}; {j.get('message', '')}", "HTTP 403", s == 403, "respuesta JSON registrada")

s, j, _ = call("GET", "/expedientes/buscar?dni=12345678A", token=tokens["admin"])
check("CP-05", "RF-02", "Búsqueda por DNI existente", f"HTTP {s}; coincidencias={len(j.get('data', []))}", "HTTP 200 y al menos un expediente", s == 200 and len(j.get("data", [])) >= 1, "respuesta JSON registrada")

s, j, _ = call("GET", "/expedientes/buscar?dni=12345678A%27%20OR%201%3D1--", token=tokens["admin"])
check("CP-06", "RNF-04", "Entrada similar a inyección SQL", f"HTTP {s}; {j.get('message', '')}", "HTTP 422; dato rechazado", s == 422, "validación de DNI")

payload = {
    "responsable": {"dni": "45123456C", "nombre": "Laura", "apellidos": "Sanz Mora", "telefono": "611222333", "email": "laura@example.local", "direccion": "Calle Nueva 3"},
    "fallecido": {"dni": "45234567D", "nombre": "Carlos", "apellidos": "Mora Pérez", "fecha_defuncion": "2026-05-24", "lugar_defuncion": "Zaragoza"},
}
s, j, _ = call("POST", "/expedientes", payload, token=tokens["admin"])
new_exp_id = j.get("data", {}).get("id") if isinstance(j, dict) else None
check("CP-07", "RF-03", "Alta de expediente y personas diferenciadas", f"HTTP {s}; id={new_exp_id}", "HTTP 201 e id de expediente", s == 201 and bool(new_exp_id), "respuesta JSON registrada")

s, j, _ = call("POST", "/ordenes", {"expediente_id": new_exp_id, "tipo_servicio": "inhumacion", "observacion_general": "Demostración final"}, token=tokens["admin"])
new_order_id = j.get("data", {}).get("id") if isinstance(j, dict) else None
check("CP-08", "RF-04 / RF-05", "Creación de orden funeraria", f"HTTP {s}; id={new_order_id}; tipo={j.get('data', {}).get('tipo_servicio')}", "HTTP 201 y orden en borrador", s == 201 and bool(new_order_id), "respuesta JSON registrada")

s, j, _ = call("POST", f"/ordenes/{new_order_id}/productos", {"producto_id": 1, "cantidad": 1}, token=tokens["admin"])
total_prod = j.get("data", {}).get("total_estimado") if isinstance(j, dict) else None
check("CP-09", "RF-06 / RF-07", "Añadir producto y recalcular total", f"HTTP {s}; total={total_prod}", "HTTP 201; total 650.00", s == 201 and float(total_prod) == 650.0, "respuesta JSON registrada")

s, j, _ = call("POST", f"/ordenes/{new_order_id}/productos", {"producto_id": 1, "cantidad": 0}, token=tokens["admin"])
check("CP-10", "RF-06 / RNF-05", "Rechazo de cantidad no positiva", f"HTTP {s}; {j.get('message', '')}", "HTTP 422", s == 422, "respuesta JSON registrada")

s, j, _ = call("POST", f"/ordenes/{new_order_id}/servicios", {"servicio_id": 2}, token=tokens["admin"])
total_serv = j.get("data", {}).get("total_estimado") if isinstance(j, dict) else None
check("CP-11", "RF-05 / RF-07", "Añadir servicio y sumar presupuesto", f"HTTP {s}; total={total_serv}", "HTTP 201; total 870.00", s == 201 and float(total_serv) == 870.0, "respuesta JSON registrada")

xss = "<script>alert(1)</script> Confirmación"
s, j, _ = call("POST", f"/ordenes/{new_order_id}/observaciones", {"texto": xss}, token=tokens["admin"])
texts = [o.get("texto", "") for o in j.get("data", {}).get("observaciones", [])] if isinstance(j, dict) else []
escaped = any("&lt;script&gt;" in t for t in texts)
check("CP-12", "RF-09 / RNF-04", "Saneamiento de observación con etiqueta script", f"HTTP {s}; escapado={escaped}", "Texto almacenado escapado", s == 201 and escaped, "respuesta JSON registrada")

s, j, _ = call("PUT", f"/ordenes/{new_order_id}", {"estado_id": 3}, token=tokens["admin"])
state = j.get("data", {}).get("estado") if isinstance(j, dict) else ""
check("CP-13", "RF-09", "Cambio de estado", f"HTTP {s}; estado={state}", "pendiente de validación", s == 200 and state == "pendiente de validación", "respuesta JSON registrada")

s, pdf, ctype = call("GET", f"/ordenes/{new_order_id}/pdf", token=tokens["admin"], pdf=True)
pdf_path = OUTDIR / "orden_generada_prueba.pdf"
pdf_path.write_bytes(pdf)
check("CP-14", "RF-08", "Generación de resumen PDF", f"HTTP {s}; tipo={ctype}; bytes={len(pdf)}", "PDF descargable no vacío", s == 200 and pdf.startswith(b"%PDF") and len(pdf) > 1000, pdf_path.name)

s, j, _ = call("GET", "/admin/catalogos", token=tokens["admin"])
data = j.get("data", {}) if isinstance(j, dict) else {}
check("CP-15", "RF-01 / RF-06", "Consulta de catálogos con rol administrador", f"HTTP {s}; productos={len(data.get('productos', []))}; servicios={len(data.get('servicios', []))}", "Catálogos disponibles", s == 200 and len(data.get("productos", [])) >= 1 and len(data.get("servicios", [])) >= 1, "respuesta JSON registrada")

s, j, _ = call("GET", "/ordenes", token=tokens["admin"])
orders = j.get("data", []) if isinstance(j, dict) else []
check("CP-16", "RF-09", "Listado e historial general de órdenes", f"HTTP {s}; ordenes={len(orders)}", "HTTP 200 y listado no vacío", s == 200 and len(orders) >= 1, "respuesta JSON registrada")

s, j, _ = call("GET", f"/ordenes/{new_order_id}/resumen", token=tokens["admin"])
historial = j.get("data", {}).get("historial_estados", []) if isinstance(j, dict) else []
tiene_cambio = any(item.get("accion") == "cambiar_estado" for item in historial)
check("CP-17", "RF-09", "Historial de cambios de estado de una orden", f"HTTP {s}; eventos={len(historial)}; cambio_registrado={tiene_cambio}", "Creación y cambio de estado trazables", s == 200 and len(historial) >= 2 and tiene_cambio, "respuesta JSON registrada")

s, j, _ = call("POST", "/auth/login", {"email": "asesor@memora.local", "password": "Asesor1234"})
tokens["asesor"] = j.get("token") if isinstance(j, dict) else None
s, j, _ = call("GET", "/productos", token=tokens["asesor"])
productos = j.get("data", []) if isinstance(j, dict) else []
categorias = sorted(set(item.get("categoria") for item in productos))
check("CP-18", "RF-06", "Consulta visual de catálogos para asesor", f"HTTP {s}; categorías={categorias}", "Productos de ataúdes, flores y urnas disponibles", s == 200 and all(cat in categorias for cat in ["ataudes", "flores", "urnas"]), "respuesta JSON registrada")

s, j, _ = call("POST", "/auth/login", {"email": "gerencia@memora.local", "password": "Gerencia1234"})
tokens["gerencia"] = j.get("token") if isinstance(j, dict) else None
s, j, _ = call("GET", "/seguimiento/personal-pedidos", token=tokens["gerencia"])
personal = j.get("data", {}).get("personal", []) if isinstance(j, dict) else []
check("CP-19", "RF-09", "Consulta gerencial de pedidos por personal", f"HTTP {s}; personal={len(personal)}", "Vista con asesor y recepción", s == 200 and len(personal) >= 2, "respuesta JSON registrada")

s, j, _ = call("GET", "/seguimiento/personal-pedidos", token=tokens["asesor"])
check("CP-20", "RNF-04", "Protección de consulta gerencial por rol", f"HTTP {s}; {j.get('message', '')}", "HTTP 403 para asesor", s == 403, "respuesta JSON registrada")

summary = {
    "fecha_ejecucion": date.today().isoformat(),
    "entorno": "Backend Node.js con DB_MODE=memory (adaptador de demostración incorporado para prueba reproducible sin Docker). La persistencia MySQL mediante Docker queda pendiente de ejecución en el equipo de entrega.",
    "resultados": records,
    "total": len(records),
    "superadas": sum(1 for record in records if record["estado"] == "SUPERADA"),
}
(OUTDIR / "resultados_api_demo.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
md = [
    "# Registro de pruebas ejecutadas - Memora Flow", "",
    f"**Fecha de ejecución:** {date.today().strftime('%d/%m/%Y')}  ",
    "**Entorno ejecutado:** API Node.js/Express con `DB_MODE=memory`, datos de prueba precargados y autenticación JWT.  ",
    "**Alcance de la evidencia:** verifica rutas, reglas de negocio, seguridad básica y generación PDF. La persistencia MySQL/Docker y el despliegue público requieren validación posterior en el equipo de entrega.", "",
    f"**Resultado:** {summary['superadas']}/{summary['total']} pruebas superadas.", "",
    "| ID | Requisito | Prueba | Resultado obtenido | Estado |", "|---|---|---|---|---|",
]
md.extend(f"| {r['id']} | {r['requisito']} | {r['prueba']} | {r['resultado_obtenido']} | {r['estado']} |" for r in records)
md.extend(["", "## Evidencias generadas", "", "- `resultados_api_demo.json`: registro estructurado de respuestas y resultados.", "- `orden_generada_prueba.pdf`: PDF generado mediante la API durante la prueba CP-14.", "", "## Verificaciones pendientes antes del depósito", "", "- Arranque completo mediante Docker Compose con MySQL 8.4 y phpMyAdmin en el equipo del alumno.", "- Capturas reales de la aplicación funcionando con MySQL.", "- Publicación del repositorio actualizado y comprobación de la URL de despliegue."])
(OUTDIR / "registro_pruebas_ejecutadas.md").write_text("\n".join(md), encoding="utf-8")
print(json.dumps({"api_base": BASE, "total": summary["total"], "superadas": summary["superadas"], "pdf": str(pdf_path)}, ensure_ascii=False))
