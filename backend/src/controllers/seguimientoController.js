import { asyncHandler } from '../utils/asyncHandler.js';
import * as seguimientoRepository from '../repositories/seguimientoRepository.js';

export const personalPedidos = asyncHandler(async (req, res) => {
  const [personal, pedidosAsesor, pedidosRecepcion] = await Promise.all([
    seguimientoRepository.listPersonalOperativo(),
    seguimientoRepository.listOrdenesAsignadasAAsesores(),
    seguimientoRepository.listOrdenesDerivadasDeRecepcion()
  ]);

  const pedidos = [...pedidosAsesor, ...pedidosRecepcion];
  const resumen = personal.map((person) => {
    const personalOrders = pedidos.filter((pedido) => pedido.usuario_id === person.id);
    return {
      ...person,
      total_pedidos: personalOrders.length,
      importe_total: personalOrders.reduce((total, pedido) => total + Number(pedido.total_estimado || 0), 0)
    };
  });

  res.json({ data: { personal: resumen, pedidos } });
});
