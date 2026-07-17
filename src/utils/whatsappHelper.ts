import { DailyReport } from "../types";

export const generateWhatsAppText = (report: DailyReport): string => {
  const totalHoursMan = report.recursos.manoObra.reduce((acc, curr) => acc + curr.horas, 0);
  const totalHoursMachine = report.recursos.maquinaria.reduce(
    (acc, curr) => acc + curr.horasOperativas + curr.horasStandby,
    0
  );
  
  let text = `*CIERRE DIARIO DE OBRA* 🏗️\n`;
  text += `*Fecha:* ${report.fecha}\n`;
  text += `*Capataz:* ${report.capataz || 'No especificado'}\n`;
  text += `*Frente de Trabajo:* ${report.frenteTrabajo || 'No especificado'}\n\n`;
  
  text += `*1. ACTIVIDADES EJECUTADAS*:\n`;
  if (report.actividades.length === 0) text += `_Sin actividades registradas_\n`;
  report.actividades.forEach((act) => {
    const pks = act.pkInicio || act.pkFin ? ` (PK: ${act.pkInicio || ''} - ${act.pkFin || ''})` : '';
    text += `- ${act.descripcion || 'Sin descripción'}${pks}: *${act.horas} hrs*\n`;
  });
  text += `\n`;
  
  text += `*2. RECURSOS Y HORAS MANO DE OBRA*:\n`;
  if (report.recursos.manoObra.length === 0) text += `_Sin mano de obra registrada_\n`;
  report.recursos.manoObra.forEach((mo) => {
    const act = report.actividades.find(a => a.id === mo.actividadId)?.descripcion || 'Actividad';
    const cargo = mo.cargo ? ` [${mo.cargo}]` : '';
    const just = mo.justificacion ? ` (Nota: ${mo.justificacion})` : '';
    text += `- ${mo.nombre || 'Sin nombre'}${cargo}: *${mo.horas} hrs* en "${act}"${just}\n`;
  });
  text += `Total Horas Hombre: *${totalHoursMan} HH*\n\n`;
  
  text += `*3. RECURSOS Y HORAS MAQUINARIA*:\n`;
  if (report.recursos.maquinaria.length === 0) text += `_Sin maquinaria registrada_\n`;
  report.recursos.maquinaria.forEach((maq) => {
    const act = report.actividades.find(a => a.id === maq.actividadId)?.descripcion || 'Actividad';
    const standby = maq.horasStandby > 0 ? ` [Standby: ${maq.horasStandby} hrs]` : '';
    const just = maq.justificacion ? ` (Justificación: ${maq.justificacion})` : '';
    text += `- ${maq.codigo || 'Sin código'}: *${maq.horasOperativas} hrs* operativas${standby} en "${act}"${just}\n`;
  });
  text += `Total Horas Máquina: *${totalHoursMachine} HM*\n\n`;
  
  if (report.hptPhoto) {
    text += `✓ *HPT firmada adjunta en dispositivo.*\n`;
  }
  if (report.fotosAvance.length > 0) {
    text += `✓ *Fotografías de avance tomadas:* ${report.fotosAvance.length} fotos.\n`;
  }
  
  text += `\n_Generado automáticamente por Obra-OS_`;
  return text;
};

export const getWhatsAppURL = (report: DailyReport): string => {
  const formatted = generateWhatsAppText(report);
  return `https://wa.me/?text=${encodeURIComponent(formatted)}`;
};
