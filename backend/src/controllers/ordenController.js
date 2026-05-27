import { asyncHandler } from '../utils/asyncHandler.js';
import * as ordenService from '../services/ordenService.js';
import { generateOrdenPdf } from '../services/pdfService.js';

export const listar = asyncHandler(async (req, res) => {
  const ordenes = await ordenService.list();
  res.json({ data: ordenes });
});

export const crear = asyncHandler(async (req, res) => {
  const orden = await ordenService.create(req.body, req.user);
  res.status(201).json({ data: orden });
});

export const obtener = asyncHandler(async (req, res) => {
  const orden = await ordenService.getOrden(req.params.id);
  res.json({ data: orden });
});

export const actualizar = asyncHandler(async (req, res) => {
  const orden = await ordenService.update(req.params.id, req.body, req.user);
  res.json({ data: orden });
});

export const resumen = asyncHandler(async (req, res) => {
  const orden = await ordenService.getOrden(req.params.id);
  res.json({ data: orden });
});

export const addProducto = asyncHandler(async (req, res) => {
  const orden = await ordenService.addProducto(req.params.id, req.body, req.user);
  res.status(201).json({ data: orden });
});

export const deleteProducto = asyncHandler(async (req, res) => {
  const orden = await ordenService.deleteProducto(req.params.id, req.params.detalleId, req.user);
  res.json({ data: orden });
});

export const addServicio = asyncHandler(async (req, res) => {
  const orden = await ordenService.addServicio(req.params.id, req.body, req.user);
  res.status(201).json({ data: orden });
});

export const addObservacion = asyncHandler(async (req, res) => {
  const orden = await ordenService.addObservacion(req.params.id, req.body, req.user);
  res.status(201).json({ data: orden });
});

export const pdf = asyncHandler(async (req, res) => {
  const orden = await ordenService.getOrden(req.params.id);
  generateOrdenPdf(orden, res);
});
