import { Send } from "lucide-react";
import { DailyReport } from "../../types";
import { getWhatsAppURL } from "../../utils/whatsappHelper";

interface ReportDetailModalProps {
  report: DailyReport | null;
  onClose: () => void;
}

export default function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-350 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
          <div>
            <h3 className="font-extrabold text-white text-base">Detalles del Cierre Diario</h3>
            <p className="text-xs text-slate-300">{report.fecha} - {report.frenteTrabajo}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-slate-700"
          >
            Cerrar
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-800">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase block">Capataz</span>
              <span className="font-bold text-slate-900">{report.capataz}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase block">Fecha</span>
              <span className="font-bold text-slate-900">{report.fecha}</span>
            </div>
          </div>

          {/* Actividades */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-tight text-xs text-slate-500">1. Actividades Ejecutadas</h4>
            <div className="space-y-1.5">
              {report.actividades.map((act) => (
                <div key={act.id} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="font-semibold text-slate-900">{act.descripcion}</span>
                    {(act.pkInicio || act.pkFin) && (
                      <span className="text-xs text-slate-500 block font-medium">PK: {act.pkInicio || 'N/A'} - {act.pkFin || 'N/A'}</span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold bg-slate-100 text-slate-850 px-2 py-0.5 rounded border border-slate-300">{act.horas} hrs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mano de Obra */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-tight text-xs text-slate-500">2. Mano de Obra</h4>
            <div className="space-y-1.5">
              {report.recursos.manoObra.map((mo) => {
                const actName = report.actividades.find(a => a.id === mo.actividadId)?.descripcion || 'Actividad';
                return (
                  <div key={mo.id} className="bg-slate-55 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{mo.nombre}</span>
                      <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">{mo.horas} hrs</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Actividad: {actName}</p>
                    {mo.justificacion && <p className="text-xs text-amber-700 mt-0.5 font-bold">Nota: {mo.justificacion}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maquinaria */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-tight text-xs text-slate-500">3. Maquinaria</h4>
            <div className="space-y-1.5">
              {report.recursos.maquinaria.map((maq) => {
                const actName = report.actividades.find(a => a.id === maq.actividadId)?.descripcion || 'Actividad';
                return (
                  <div key={maq.id} className="bg-slate-55 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{maq.codigo}</span>
                      <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">Op: {maq.horasOperativas}h / Stby: {maq.horasStandby}h</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Actividad: {actName}</p>
                    {maq.justificacion && <p className="text-xs text-amber-700 mt-0.5 font-bold">Justificación: {maq.justificacion}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Archivos Cargados */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase tracking-tight text-xs text-slate-500">HPT Firmada</h4>
              {report.hptPhoto ? (
                <div className="rounded-lg overflow-hidden border border-slate-300 relative group aspect-video max-h-36 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={report.hptPhoto} 
                    alt="HPT Firmada" 
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic font-medium">No se adjuntó HPT</p>
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 mb-2 uppercase tracking-tight text-xs text-slate-500">Fotos de Avance</h4>
              {report.fotosAvance.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 max-h-36">
                  {report.fotosAvance.map((f) => (
                    <div key={f.id} className="flex-shrink-0 w-24 rounded-lg overflow-hidden border border-slate-300 relative aspect-square shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={f.photo} 
                        alt={f.descripcion} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic font-medium">No se adjuntaron fotografías</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <a
            href={getWhatsAppURL(report)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-extrabold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow"
          >
            <Send className="h-4 w-4" /> Enviar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
