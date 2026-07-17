import { Send, Check, Copy, FileCheck, Camera } from "lucide-react";
import { PhotoAvance } from "../../types";

interface StepPreviewProps {
  hptPhoto: string | null;
  fotosAvance: PhotoAvance[];
  copied: boolean;
  handleCopyText: () => void;
  handleSendWhatsApp: () => void;
  getWhatsAppMessageText: () => string;
}

export default function StepPreview({
  hptPhoto,
  fotosAvance,
  copied,
  handleCopyText,
  handleSendWhatsApp,
  getWhatsAppMessageText
}: StepPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <Send className="h-5 w-5 text-emerald-600" />
          5. Resumen y Envío
        </h2>
        <p className="text-xs text-slate-500 font-medium">Revisa el reporte consolidado e inicie la subida a WhatsApp.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase">Texto del Mensaje Generado</label>
            <button
              type="button"
              onClick={handleCopyText}
              className="w-full sm:w-auto justify-center text-xs font-bold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg flex items-center gap-1 active:scale-[0.98] transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              {copied ? "COPIADO" : "COPIAR TEXTO"}
            </button>
          </div>

          <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-100 leading-relaxed whitespace-pre-wrap select-all max-h-[40vh] overflow-y-auto shadow-inner">
            {getWhatsAppMessageText()}
          </div>
        </div>

        {/* Notas informativas sobre archivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2.5">
            <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded border border-emerald-200 mt-0.5">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider text-[10px]">HPT Firmada</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {hptPhoto ? "✓ Guardada en el borrador del dispositivo." : "⚠ No se ha subido foto de HPT."}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2.5">
            <div className="bg-slate-200 text-slate-800 p-1.5 rounded border border-slate-300 mt-0.5">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider text-[10px]">Fotos de Avance</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {fotosAvance.length > 0 ? `✓ ${fotosAvance.length} fotos guardadas localmente.` : "⚠ Sin fotografías de avance."}
              </span>
            </div>
          </div>
        </div>

        {/* Botón enviar por WhatsApp */}
        <button
          type="button"
          onClick={handleSendWhatsApp}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 group transition-all uppercase tracking-wider"
        >
          <Send className="h-5 w-5" />
          Enviar a WhatsApp del Secretario Técnico
        </button>
      </div>
    </div>
  );
}
