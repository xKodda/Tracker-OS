import { Calendar, MapPin, User, Send, Trash2 } from "lucide-react";
import { DailyReport } from "../../types";
import { getWhatsAppURL } from "../../utils/whatsappHelper";

interface ReportCardProps {
  report: DailyReport;
  onViewDetails: () => void;
  onDelete: () => void;
}

export default function ReportCard({ report, onViewDetails, onDelete }: ReportCardProps) {
  const totalHours = report.actividades.reduce((acc, curr) => acc + curr.horas, 0);
  const hasPhotos = report.fotosAvance.length > 0;
  const hasHpt = report.hptPhoto !== null;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white hover:border-slate-350 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
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
          onClick={onViewDetails}
          className="text-xs font-bold px-3 py-2 bg-slate-55 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 transition-colors"
        >
          Ver Detalles
        </button>
        <a
          href={getWhatsAppURL(report)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-extrabold px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow"
        >
          <Send className="h-3.5 w-3.5" /> Enviar WhatsApp
        </a>
        <button
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
