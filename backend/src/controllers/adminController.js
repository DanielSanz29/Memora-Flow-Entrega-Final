import { asyncHandler } from '../utils/asyncHandler.js';
import * as userRepository from '../repositories/userRepository.js';
import * as catalogRepository from '../repositories/catalogRepository.js';

export const usuarios = asyncHandler(async (req, res) => {
  res.json({ data: await userRepository.listUsers() });
});

export const catalogos = asyncHandler(async (req, res) => {
  const [roles, estados, categorias, productos, servicios] = await Promise.all([
    catalogRepository.getRoles(),
    catalogRepository.getEstados(),
    catalogRepository.getCategorias(),
    catalogRepository.getProductos(),
    catalogRepository.getServicios()
  ]);

  res.json({ data: { roles, estados, categorias, productos, servicios } });
});
