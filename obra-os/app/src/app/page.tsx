"use client";

import Link from "next/link";
import { useReports } from "../hooks/useReports";
import { 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Trash2, 
  Send, 
  Database,
  CheckCircle,
  Clock,
  HardHat,
  ChevronRight,
  Image as ImageIcon,
  FileCheck
} from "lucide-react";
import { useState } from "react";
import { DailyReport } from "../types";

export default function Dashboard() {
  const { reports, draft, loading, deleteReport, clearDraft } = useReports();
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  // Formatear texto de WhatsApp
  const getWhatsAppLink = (report: DailyReport) => {
    const totalHoursMan = report.recursos.manoObra.reduce((acc, curr) => acc + curr.horas, 0);
    const totalHoursMachine = report.recursos.maquinaria.reduce((acc, curr) => acc + curr.horasOperativas + curr.horasStandby, 0);
    
    let text = `*CIERRE DIARIO DE OBRA* 🏗️\n`;
    text += `*Fecha:* ${report.fecha}\n`;
    text += `*Capataz:* ${report.capataz}\n`;
    text += `*Frente de Trabajo:* ${report.frenteTrabajo}\n\n`;
    
    text += `*1. ACTIVIDADES EJECUTADAS*:\n`;
    report.actividades.forEach((act, i) => {
      const pks = act.pkInicio || act.pkFin ? ` (PK: ${act.pkInicio || ''} - ${act.pkFin || ''})` : '';
      text += `- ${act.descripcion}${pks}: *${act.horas} hrs*\n`;
    });
    text += `\n`;
    
    text += `*2. RECURSOS Y HORAS MANO DE OBRA*:\n`;
    report.recursos.manoObra.forEach((mo) => {
      const act = report.actividades.find(a => a.id === mo.actividadId)?.descripcion || 'Actividad';
      const just = mo.justificacion ? ` (Nota: ${mo.justificacion})` : '';
      text += `- ${mo.nombre}: *${mo.horas} hrs* en "${act}"${just}\n`;
    });
    text += `Total Horas Hombre: *${totalHoursMan} HH*\n\n`;
    
    text += `*3. RECURSOS Y HORAS MAQUINARIA*:\n`;
    report.recursos.maquinaria.forEach((maq) => {
      const act = report.actividades.find(a => a.id === maq.actividadId)?.descripcion || 'Actividad';
      const standby = maq.horasStandby > 0 ? ` [Standby: ${maq.horasStandby} hrs]` : '';
      const just = maq.justificacion ? ` (Justificación: ${maq.justificacion})` : '';
      text += `- ${maq.codigo}: *${maq.horasOperativas} hrs* operativas${standby} en "${act}"${just}\n`;
    });
    text += `Total Horas Máquina: *${totalHoursMachine} HM*\n\n`;
    
    if (report.hptPhoto) {
      text += `✓ *HPT firmada adjunta en dispositivo.*\n`;
    }
    if (report.fotosAvance.length > 0) {
      text += `✓ *Fotografías de avance tomadas:* ${report.fotosAvance.length} fotos.\n`;
    }
    
    text += `\n_Generado automáticamente por Obra-OS_`;
    
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-slate-400 font-medium">Cargando aplicación de terreno...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 font-sans min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Obra-OS
              </h1>
              <p className="text-xs text-slate-500 font-medium">Cierre Diario Simplificado</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
            <Database className="h-3.5 w-3.5" />
            <span>Local Activo</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6 pb-24">
        {/* Banner de Borrador Activo */}
        {draft && (
          <div className="rounded-2xl border border-amber-900/50 bg-gradient-to-br from-amber-950/20 to-amber-900/10 p-5 shadow-lg shadow-amber-950/10">
            <div className="flex items-start gap-4">
              <div className="bg-amber-950/80 p-2 rounded-xl text-amber-400 mt-0.5">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-amber-300">Borrador pendiente detectado</h3>
                <p className="text-sm text-slate-400">
                  Tienes un reporte del <span className="font-medium text-amber-200">{draft.fecha}</span> en el frente <span className="font-medium text-amber-200">{draft.frenteTrabajo || "No especificado"}</span> sin finalizar.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    href="/nuevo"
                    className="text-xs font-semibold px-4 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 rounded-xl transition-all shadow-md shadow-amber-600/10"
                  >
                    Continuar Borrador
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas eliminar este borrador y comenzar uno nuevo?")) {
                        clearDraft();
                      }
                    }}
                    className="text-xs font-semibold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition-all border border-slate-800 hover:text-red-400"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 gap-4">
          <Link
            href="/nuevo"
            className="group relative rounded-2xl overflow-hidden border border-indigo-900/40 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 p-6 flex items-center justify-between shadow-xl shadow-indigo-950/5 hover:border-indigo-500/50 transition-all duration-300 active:scale-[0.99]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-indigo-600 p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                <Plus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold group-hover:text-indigo-300 transition-colors">Nuevo Cierre Diario</h2>
                <p className="text-xs text-slate-400 max-w-sm">Registra actividades, distribuye horas y genera el informe para enviar a WhatsApp en minutos.</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Historial */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-200 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Historial de Cierres Diarios
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {reports.length} {reports.length === 1 ? "reporte" : "reportes"}
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-900 bg-slate-950 p-12 text-center flex flex-col items-center justify-center">
              <div className="bg-slate-900/60 p-4 rounded-full text-slate-600 mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-300 mb-1">Sin reportes registrados</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                Los reportes que completes y finalices se guardarán de forma local en este dispositivo para tu control personal.
              </p>
              <Link
                href="/nuevo"
                className="text-xs font-semibold px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Crear mi primer reporte
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {reports.map((report) => {
                const totalHours = report.actividades.reduce((acc, curr) => acc + curr.horas, 0);
                const hasPhotos = report.fotosAvance.length > 0;
                const hasHpt = report.hptPhoto !== null;

                return (
                  <div
                    key={report.id}
                    className="group rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-900/50">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{report.fecha}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{report.frenteTrabajo}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          <span>Capataz: <strong className="text-slate-300 font-medium">{report.capataz}</strong></span>
                        </span>
                        <span>•</span>
                        <span>Horas: <strong className="text-slate-300 font-medium">{totalHours} hrs</strong></span>
                        {hasHpt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-emerald-400">
                              <FileCheck className="h-3.5 w-3.5" /> HPT
                            </span>
                          </>
                        )}
                        {hasPhotos && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-indigo-400">
                              <ImageIcon className="h-3.5 w-3.5" /> {report.fotosAvance.length} Fotos
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-xs font-semibold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-slate-800"
                      >
                        Ver Detalles
                      </button>
                      <a
                        href={getWhatsAppLink(report)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
                      >
                        <Send className="h-3.5 w-3.5" /> Enviar
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar reporte del ${report.fecha}?`)) {
                            deleteReport(report.id);
                          }
                        }}
                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all border border-transparent hover:border-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalles */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-200">Resumen Cierre Diario</h3>
                <p className="text-xs text-slate-400">{selectedReport.fecha} - {selectedReport.frenteTrabajo}</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-xs font-semibold px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg"
              >
                Cerrar
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-900">
                <div>
                  <span className="text-xs text-slate-500 block">Capataz</span>
                  <span className="font-semibold text-slate-200">{selectedReport.capataz}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Fecha</span>
                  <span className="font-semibold text-slate-200">{selectedReport.fecha}</span>
                </div>
              </div>

              {/* Actividades */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">1. Actividades Ejecutadas</h4>
                <div className="space-y-1.5">
                  {selectedReport.actividades.map((act) => (
                    <div key={act.id} className="flex justify-between items-center py-1">
                      <div>
                        <span className="font-medium text-slate-200">{act.descripcion}</span>
                        {(act.pkInicio || act.pkFin) && (
                          <span className="text-xs text-slate-500 block">PK: {act.pkInicio || 'N/A'} - {act.pkFin || 'N/A'}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold bg-indigo-950/60 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/40">{act.horas} hrs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mano de Obra */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">2. Mano de Obra</h4>
                <div className="space-y-1.5">
                  {selectedReport.recursos.manoObra.map((mo) => {
                    const actName = selectedReport.actividades.find(a => a.id === mo.actividadId)?.descripcion || 'Actividad';
                    return (
                      <div key={mo.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-200">{mo.nombre}</span>
                          <span className="text-xs font-bold text-slate-400">{mo.horas} hrs</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Actividad: {actName}</p>
                        {mo.justificacion && <p className="text-xs text-amber-400/80 mt-0.5">Nota: {mo.justificacion}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Maquinaria */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">3. Maquinaria</h4>
                <div className="space-y-1.5">
                  {selectedReport.recursos.maquinaria.map((maq) => {
                    const actName = selectedReport.actividades.find(a => a.id === maq.actividadId)?.descripcion || 'Actividad';
                    return (
                      <div key={maq.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-200">{maq.codigo}</span>
                          <span className="text-xs font-bold text-slate-400">Op: {maq.horasOperativas}h / Stby: {maq.horasStandby}h</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Actividad: {actName}</p>
                        {maq.justificacion && <p className="text-xs text-amber-400/80 mt-0.5">Justificación: {maq.justificacion}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Archivos Cargados */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-2">HPT Firmada</h4>
                  {selectedReport.hptPhoto ? (
                    <div className="rounded-lg overflow-hidden border border-slate-850 relative group aspect-video max-h-36">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={selectedReport.hptPhoto} 
                        alt="HPT Firmada" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No se adjuntó HPT</p>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-2">Fotos de Avance</h4>
                  {selectedReport.fotosAvance.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1 max-h-36">
                      {selectedReport.fotosAvance.map((f) => (
                        <div key={f.id} className="flex-shrink-0 w-24 rounded-lg overflow-hidden border border-slate-850 relative aspect-square">
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
                    <p className="text-xs text-slate-500 italic">No se adjuntaron fotografías</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <a
                href={getWhatsAppLink(selectedReport)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" /> Enviar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
