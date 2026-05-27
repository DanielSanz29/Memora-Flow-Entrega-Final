import PDFDocument from 'pdfkit';

function money(value) {
  return `${Number(value || 0).toFixed(2)} EUR`;
}

function line(doc, label, value) {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(value || '-');
}

export function generateOrdenPdf(orden, res) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="orden-${orden.id}.pdf"`);

  doc.pipe(res);

  doc.fontSize(20).font('Helvetica-Bold').text('Memora Flow', { align: 'center' });
  doc.fontSize(13).font('Helvetica').text('Resumen de orden funeraria', { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(15).font('Helvetica-Bold').text('Datos del expediente');
  doc.moveDown(0.3);
  line(doc, 'Código', orden.expediente.codigo);
  line(doc, 'Estado expediente', orden.expediente.estado);
  line(doc, 'Fecha orden', new Date(orden.fecha_creacion).toLocaleString('es-ES'));
  doc.moveDown();

  doc.fontSize(15).font('Helvetica-Bold').text('Familiar responsable');
  doc.moveDown(0.3);
  line(doc, 'Nombre', `${orden.responsable.nombre} ${orden.responsable.apellidos}`);
  line(doc, 'DNI/NIE', orden.responsable.dni);
  line(doc, 'Teléfono', orden.responsable.telefono);
  line(doc, 'Email', orden.responsable.email);
  line(doc, 'Dirección', orden.responsable.direccion);
  doc.moveDown();

  doc.fontSize(15).font('Helvetica-Bold').text('Persona fallecida');
  doc.moveDown(0.3);
  line(doc, 'Nombre', `${orden.fallecido.nombre} ${orden.fallecido.apellidos}`);
  line(doc, 'DNI/NIE', orden.fallecido.dni);
  line(doc, 'Fecha defunción', orden.fallecido.fecha_defuncion ? new Date(orden.fallecido.fecha_defuncion).toLocaleDateString('es-ES') : '-');
  line(doc, 'Lugar defunción', orden.fallecido.lugar_defuncion);
  doc.moveDown();

  doc.fontSize(15).font('Helvetica-Bold').text('Orden funeraria');
  doc.moveDown(0.3);
  line(doc, 'Tipo de servicio', orden.tipo_servicio);
  line(doc, 'Estado', orden.estado);
  line(doc, 'Observación general', orden.observacion_general);
  doc.moveDown();

  doc.fontSize(15).font('Helvetica-Bold').text('Productos y flores');
  doc.moveDown(0.3);
  if (!orden.detalles.length) {
    doc.font('Helvetica').text('No hay productos añadidos.');
  } else {
    orden.detalles.forEach((item) => {
      doc.font('Helvetica').text(`- ${item.concepto} | Cantidad: ${item.cantidad} | Precio: ${money(item.precio_unitario)} | Subtotal: ${money(item.subtotal)}`);
    });
  }
  doc.moveDown();

  doc.fontSize(15).font('Helvetica-Bold').text('Servicios complementarios');
  doc.moveDown(0.3);
  if (!orden.servicios.length) {
    doc.font('Helvetica').text('No hay servicios complementarios añadidos.');
  } else {
    orden.servicios.forEach((servicio) => {
      doc.font('Helvetica').text(`- ${servicio.nombre} | Precio aplicado: ${money(servicio.precio_aplicado)}`);
    });
  }
  doc.moveDown();

  doc.fontSize(15).font('Helvetica-Bold').text('Observaciones internas');
  doc.moveDown(0.3);
  if (!orden.observaciones.length) {
    doc.font('Helvetica').text('Sin observaciones internas.');
  } else {
    orden.observaciones.forEach((observacion) => {
      doc.font('Helvetica').text(`- ${observacion.fecha_creacion}: ${observacion.texto} (${observacion.usuario})`);
    });
  }
  doc.moveDown(1.5);

  doc.fontSize(16).font('Helvetica-Bold').text(`Total estimado: ${money(orden.total_estimado)}`, { align: 'right' });
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica').text('Documento generado automáticamente por Memora Flow. Datos de prueba sin validez real.', { align: 'center' });

  doc.end();
}
