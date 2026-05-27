import { asyncHandler } from '../utils/asyncHandler.js';
import * as expedienteService from '../services/expedienteService.js';

export const buscar = asyncHandler(async (req, res) => {
  const expedientes = await expedienteService.search(req.query.dni);
  res.json({ data: expedientes });
});

export const crear = asyncHandler(async (req, res) => {
  const expediente = await expedienteService.create(req.body, req.user);
  res.status(201).json({ data: expediente });
});

export const obtener = asyncHandler(async (req, res) => {
  const expediente = await expedienteService.getById(req.params.id);
  res.json({ data: expediente });
});

export const actualizar = asyncHandler(async (req, res) => {
  const expediente = await expedienteService.update(req.params.id, req.body, req.user);
  res.json({ data: expediente });
});
