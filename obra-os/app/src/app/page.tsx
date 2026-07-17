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
    report.actividades.forEach((act) => {
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
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-55 text-slate-800 p-6 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="mt-4 text-slate-600 font-bold">Cargando aplicación de terreno...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-100 text-slate-900 font-sans min-h-screen">
      {/* Header Industrial */}
      <header className="bg-slate-900 text-white shadow-md px-4 py-4 sm:px-6 border-b-4 border-amber-500 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg flex items-center justify-center shadow-inner">
              <HardHat className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Obra-OS
              </h1>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Control de Maquinaria y Obra</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md bg-emerald-900 text-emerald-300 border border-emerald-700">
            <Database className="h-3.5 w-3.5" />
            <span>LOCAL ACTIVO</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6 pb-24">
        {/* Banner de Borrador Activo */}
        {draft && (
          <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 shadow-md">
            <div className="flex items-start gap-4">
              <div className="bg-amber-500 p-2.5 rounded-lg text-slate-950 shadow-sm mt-0.5">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Borrador pendiente en el dispositivo</h3>
                <p className="text-sm text-slate-700">
                  Tienes un reporte del <span className="font-bold text-slate-900">{draft.fecha}</span> en el frente <span className="font-bold text-slate-900">{draft.frenteTrabajo || "No especificado"}</span> sin finalizar.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    href="/nuevo"
                    className="text-xs font-extrabold px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-lg shadow transition-colors uppercase tracking-wider"
                  >
                    Continuar Borrador
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas eliminar este borrador y comenzar uno nuevo?")) {
                        clearDraft();
                      }
                    }}
                    className="text-xs font-bold px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-300 hover:text-red-600"
                  >
                    Descartar Borrador
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
            className="group relative rounded-xl border-2 border-slate-200 bg-white p-6 flex items-center justify-between shadow-sm hover:border-amber-500 hover:shadow-md transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 p-3.5 rounded-xl text-slate-950 shadow-md group-hover:scale-105 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">Crear Reporte Diario</h2>
                <p className="text-xs text-slate-550 max-w-sm">Registra actividades, distribuye horas de maquinaria/operarios y genera el mensaje de WhatsApp.</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Historial */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2 text-base md:text-lg">
              <FileText className="h-5 w-5 text-slate-700" />
              Reportes Guardados en este Dispositivo
            </h2>
            <span className="text-xs font-extrabold px-3 py-1 rounded-md bg-slate-200 border border-slate-300 text-slate-700">
              {reports.length} {reports.length === 1 ? "reporte" : "reportes"}
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-extrabold text-slate-700 mb-1">Sin reportes anteriores</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                Los reportes diarios completados se guardan localmente para tu control personal e histórico.
              </p>
              <Link
                href="/nuevo"
                className="text-xs font-bold px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all flex items-center gap-2 shadow"
              >
                <Plus className="h-4 w-4" /> Registrar Primer Reporte
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
                    className="group rounded-xl border border-slate-200 bg-white hover:border-slate-350 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          <Calendar className="h-3.5 w-3.5 text-slate-650" />
                          <span>{report.fecha}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          <span>{report.frenteTrabajo}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-450" />
                          <span>Capataz: <strong className="text-slate-900 font-bold">{report.capataz}</strong></span>
                        </span>
                        <span>•</span>
                        <span>Horas: <strong className="text-slate-900 font-bold">{totalHours} hrs</strong></span>
                        {hasHpt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                              ✓ HPT
                            </span>
                          </>
                        )}
                        {hasPhotos && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              📸 {report.fotosAvance.length} Fotos
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-xs font-bold px-3 py-2 bg-slate-50 hover:bg-slate-150 text-slate-700 rounded-lg border border-slate-300 transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <a
                        href={getWhatsAppLink(report)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-extrabold px-3 py-2 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow"
                      >
                        <Send className="h-3.5 w-3.5" /> Enviar WhatsApp
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar reporte del ${report.fecha}?`)) {
                            deleteReport(report.id);
                          }
                        }}
                        className="p-2 text-slate-455 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-350 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div>
                <h3 className="font-extrabold text-white text-base">Detalles del Cierre Diario</h3>
                <p className="text-xs text-slate-300">{selectedReport.fecha} - {selectedReport.frenteTrabajo}</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
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
                  <span className="font-bold text-slate-900">{selectedReport.capataz}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Fecha</span>
                  <span className="font-bold text-slate-900">{selectedReport.fecha}</span>
                </div>
              </div>

              {/* Actividades */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-tight text-xs text-slate-500">1. Actividades Ejecutadas</h4>
                <div className="space-y-1.5">
                  {selectedReport.actividades.map((act) => (
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
                  {selectedReport.recursos.manoObra.map((mo) => {
                    const actName = selectedReport.actividades.find(a => a.id === mo.actividadId)?.descripcion || 'Actividad';
                    return (
                      <div key={mo.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
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
                  {selectedReport.recursos.maquinaria.map((maq) => {
                    const actName = selectedReport.actividades.find(a => a.id === maq.actividadId)?.descripcion || 'Actividad';
                    return (
                      <div key={maq.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
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
                  {selectedReport.hptPhoto ? (
                    <div className="rounded-lg overflow-hidden border border-slate-300 relative group aspect-video max-h-36 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={selectedReport.hptPhoto} 
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
                  {selectedReport.fotosAvance.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1 max-h-36">
                      {selectedReport.fotosAvance.map((f) => (
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
                href={getWhatsAppLink(selectedReport)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-extrabold px-4 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow"
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
