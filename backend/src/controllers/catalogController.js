import { asyncHandler } from '../utils/asyncHandler.js';
import * as catalogRepository from '../repositories/catalogRepository.js';

export const productos = asyncHandler(async (req, res) => {
  res.json({ data: await catalogRepository.getProductos() });
});

export const servicios = asyncHandler(async (req, res) => {
  res.json({ data: await catalogRepository.getServicios() });
});
