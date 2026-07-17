"use client";

import Link from "next/link";
import { useReports } from "../hooks/useReports";
import { Plus, FileText, HardHat, ChevronRight, Database } from "lucide-react";
import { useState } from "react";
import { DailyReport } from "../types";
import DraftBanner from "../components/dashboard/DraftBanner";
import ReportCard from "../components/dashboard/ReportCard";
import ReportDetailModal from "../components/dashboard/ReportDetailModal";

export default function Dashboard() {
  const { reports, draft, loading, deleteReport, clearDraft } = useReports();
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

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
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-none">
                Obra-OS
              </h1>
              <p className="text-[9px] sm:text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">Control de Maquinaria y Obra</p>
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
          <DraftBanner
            draft={draft}
            onClear={() => {
              if (confirm("¿Estás seguro de que deseas eliminar este borrador y comenzar uno nuevo?")) {
                clearDraft();
              }
            }}
          />
        )}

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 gap-4">
          <Link
            href="/nuevo"
            className="group relative rounded-xl border-2 border-slate-200 bg-white p-6 flex items-center justify-between shadow-sm hover:border-amber-500 hover:shadow-md transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="bg-amber-500 p-3.5 rounded-xl text-slate-950 shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                <Plus className="h-6 w-6" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight truncate">Crear Reporte Diario</h2>
                <p className="text-xs text-slate-500 max-w-sm truncate sm:whitespace-normal">Registra actividades, distribuye horas de maquinaria/operarios y genera el mensaje de WhatsApp.</p>
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
              <p className="text-sm text-slate-550 max-w-xs mx-auto mb-6">
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
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onViewDetails={() => setSelectedReport(report)}
                  onDelete={() => {
                    if (confirm(`¿Eliminar reporte del ${report.fecha}?`)) {
                      deleteReport(report.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalles */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
