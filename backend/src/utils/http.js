export function ok(res, data, message = 'OK') {
  return res.status(200).json({ success: true, message, data });
}

export function created(res, data, message = 'Creado correctamente') {
  return res.status(201).json({ success: true, message, data });
}

export function fail(res, status, message, errors = null) {
  return res.status(status).json({ success: false, message, errors });
}
