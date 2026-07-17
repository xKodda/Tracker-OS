import Link from "next/link";
import { Clock } from "lucide-react";
import { DailyReport } from "../../types";

interface DraftBannerProps {
  draft: DailyReport;
  onClear: () => void;
}

export default function DraftBanner({ draft, onClear }: DraftBannerProps) {
  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 shadow-md">
      <div className="flex items-start gap-4">
        <div className="bg-amber-500 p-2.5 rounded-lg text-slate-950 shadow-sm mt-0.5 animate-pulse">
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
              onClick={onClear}
              className="text-xs font-bold px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-300 hover:text-red-600"
            >
              Descartar Borrador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
