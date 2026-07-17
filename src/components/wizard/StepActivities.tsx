import { FileCheck, Plus, Trash2, Info } from "lucide-react";
import { Activity } from "../../types";

const ACTIVIDADES_PRESETS = [
  { label: "Excavación", icon: "🏗️" },
  { label: "Carga y Transporte", icon: "🚛" },
  { label: "Compactación / Relleno", icon: "🚜" },
  { label: "Despeje y Escarpe", icon: "🌱" },
  { label: "Perfilado / Nivelación", icon: "📐" },
  { label: "Acopio de Material", icon: "🪵" },
];

interface StepActivitiesProps {
  actividades: Activity[];
  addActivity: () => void;
  updateActivity: (id: string, field: keyof Activity, value: any) => void;
  removeActivity: (id: string) => void;
}

export default function StepActivities({
  actividades,
  addActivity,
  updateActivity,
  removeActivity
}: StepActivitiesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-amber-500" />
            2. Actividades del Día
          </h2>
          <p className="text-xs text-slate-500 font-medium">Indica las tareas de movimiento de tierra realizadas en la jornada.</p>
        </div>
        <button
          type="button"
          onClick={addActivity}
          className="text-xs font-extrabold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow flex items-center gap-1 uppercase tracking-wider"
        >
          <Plus className="h-4 w-4 text-amber-500" /> Agregar Actividad
        </button>
      </div>

      {actividades.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          <Info className="h-6 w-6 mx-auto mb-2 text-slate-400" />
          <p className="text-xs font-bold uppercase text-slate-700">No has agregado actividades</p>
          <p className="text-xs text-slate-500 mt-1">Presiona "Agregar Actividad" arriba para detallar las labores de hoy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actividades.map((act, index) => (
            <div 
              key={act.id} 
              className="p-5 rounded-xl bg-white border border-slate-200 relative space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">Actividad #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeActivity(act.id)}
                  className="text-slate-400 hover:text-red-655 transition-colors"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Tipo de Actividad (Movimiento de Tierra)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACTIVIDADES_PRESETS.map((preset) => {
                      const isSelected = act.descripcion === preset.label;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateActivity(act.id, "descripcion", preset.label)}
                          className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 group ${
                            isSelected 
                              ? 'border-amber-500 bg-amber-50 text-slate-900 font-extrabold ring-1 ring-amber-500' 
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-55'
                          }`}
                        >
                          <span className="text-xl">{preset.icon}</span>
                          <span className="text-xs font-bold leading-tight">{preset.label}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => updateActivity(act.id, "descripcion", "Otro")}
                      className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        act.descripcion === "Otro" || (!ACTIVIDADES_PRESETS.some(p => p.label === act.descripcion) && act.descripcion !== "")
                          ? 'border-amber-500 bg-amber-50 text-slate-900 font-extrabold ring-1 ring-amber-500' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-55'
                      }`}
                    >
                      <span className="text-xl">✏️</span>
                      <span className="text-xs font-bold leading-tight">Otro</span>
                    </button>
                  </div>
                  
                  {(act.descripcion === "Otro" || (!ACTIVIDADES_PRESETS.some(p => p.label === act.descripcion) && act.descripcion !== "")) && (
                    <input
                      type="text"
                      placeholder="Escribe la actividad manualmente..."
                      value={act.descripcion === "Otro" ? "" : act.descripcion}
                      onChange={(e) => updateActivity(act.id, "descripcion", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 mt-2 shadow-sm"
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase block">Horas Estimadas</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={act.horas}
                      onChange={(e) => updateActivity(act.id, "horas", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase block">PK Inicio</label>
                    <input
                      type="text"
                      placeholder="Ej: 14.200"
                      value={act.pkInicio || ""}
                      onChange={(e) => updateActivity(act.id, "pkInicio", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase block">PK Fin</label>
                    <input
                      type="text"
                      placeholder="Ej: 14.500"
                      value={act.pkFin || ""}
                      onChange={(e) => updateActivity(act.id, "pkFin", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
