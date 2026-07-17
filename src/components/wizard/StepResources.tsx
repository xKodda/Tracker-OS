import { HardHat, UserPlus, Trash2, Truck } from "lucide-react";
import { Activity, WorkerHours, MachineHours } from "../../types";

const MAQUINARIA_PRESETS = [
  "Excavadora",
  "Camión Tolva",
  "Bulldozer",
  "Motoniveladora",
  "Rodillo Compactador",
  "Retroexcavadora",
  "Cargador Frontal",
];

const STANDBY_PRESETS = [
  "Espera de Camiones / Tráfico",
  "Falla Mecánica / Reparación",
  "Mal Clima / Lluvia",
  "Falta de Frente Liberado / Topografía",
  "Carga de Combustible",
];

interface StepResourcesProps {
  actividades: Activity[];
  manoObra: WorkerHours[];
  maquinaria: MachineHours[];
  addWorker: (actId: string) => void;
  updateWorker: (id: string, field: keyof WorkerHours, value: any) => void;
  removeWorker: (id: string) => void;
  addMachine: (actId: string) => void;
  updateMachine: (id: string, field: keyof MachineHours, value: any) => void;
  removeMachine: (id: string) => void;
  historicalWorkers: string[];
  historicalMachines: string[];
}

export default function StepResources({
  actividades,
  manoObra,
  maquinaria,
  addWorker,
  updateWorker,
  removeWorker,
  addMachine,
  updateMachine,
  removeMachine,
  historicalWorkers,
  historicalMachines
}: StepResourcesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <HardHat className="h-5 w-5 text-amber-500" />
          3. Operarios y Maquinarias
        </h2>
        <p className="text-xs text-slate-500 font-medium">Asigna el equipo de trabajo y las máquinas utilizadas en cada actividad.</p>
      </div>

      {actividades.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          <p className="text-xs font-bold text-slate-700 uppercase">Primero debes definir actividades en el Paso 2.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {actividades.map((act) => {
            const workersForAct = manoObra.filter((mo) => mo.actividadId === act.id);
            const machinesForAct = maquinaria.filter((maq) => maq.actividadId === act.id);

            return (
              <div key={act.id} className="p-5 rounded-xl border border-slate-200 bg-white space-y-5 shadow-sm">
                {/* Cabecera Actividad */}
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{act.descripcion || "Actividad sin descripción"}</h3>
                    <p className="text-xs text-slate-500 font-medium">Lugar: PK {act.pkInicio || 'N/A'} al PK {act.pkFin || 'N/A'}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-105 text-slate-800 rounded border border-slate-200 uppercase tracking-wider">Actividad</span>
                </div>

                {/* Mano de Obra */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      Mano de Obra ({workersForAct.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => addWorker(act.id)}
                      className="text-xs font-bold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-350 flex items-center gap-0.5"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-slate-500" /> AGREGAR TRABAJADOR
                    </button>
                  </div>

                  {workersForAct.length > 0 && (
                    <div className="space-y-2">
                      {workersForAct.map((mo) => (
                        <div key={mo.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="md:col-span-6 space-y-1">
                            <input
                              type="text"
                              placeholder="Nombre del operario"
                              value={mo.nombre}
                              onChange={(e) => updateWorker(mo.id, "nombre", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                            />
                            {historicalWorkers.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-[9px] text-slate-500 font-bold self-center">Recientes:</span>
                                {historicalWorkers.slice(0, 3).map((wName) => (
                                  <button
                                    key={wName}
                                    type="button"
                                    onClick={() => updateWorker(mo.id, "nombre", wName)}
                                    className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-[9px] text-slate-700 border border-slate-200 rounded transition-colors"
                                  >
                                    {wName}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              placeholder="HH"
                              value={mo.horas}
                              onChange={(e) => updateWorker(mo.id, "horas", parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 text-center"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <input
                              type="text"
                              placeholder="Nota / Actividad"
                              value={mo.justificacion || ""}
                              onChange={(e) => updateWorker(mo.id, "justificacion", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800"
                            />
                          </div>
                          <div className="md:col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeWorker(mo.id)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Maquinaria */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      Maquinaria ({machinesForAct.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => addMachine(act.id)}
                      className="text-xs font-bold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-355 flex items-center gap-0.5"
                    >
                      <Truck className="h-3.5 w-3.5 text-slate-500" /> AGREGAR MÁQUINA
                    </button>
                  </div>

                  {machinesForAct.length > 0 && (
                    <div className="space-y-3">
                      {machinesForAct.map((maq) => {
                        const needsJustification = maq.horasStandby > 0;
                        const isJustificationMissing = needsJustification && !maq.justificacion?.trim();

                        return (
                          <div 
                            key={maq.id} 
                            className={`p-3.5 rounded-lg border transition-all ${
                              isJustificationMissing ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 bg-slate-50'
                            } space-y-3`}
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex-1 min-w-[200px] space-y-1">
                                <input
                                  type="text"
                                  placeholder="Código / Descripción (Ej: EX-05, CAT-02)"
                                  value={maq.codigo}
                                  onChange={(e) => updateMachine(maq.id, "codigo", e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 font-bold"
                                />
                                {/* Botones de sugerencias rápidas */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {/* Presets */}
                                  {MAQUINARIA_PRESETS.slice(0, 3).map((pType) => (
                                    <button
                                      key={pType}
                                      type="button"
                                      onClick={() => {
                                        const count = maquinaria.filter(m => m.codigo.startsWith(pType)).length + 1;
                                        updateMachine(maq.id, "codigo", `${pType} #${count}`);
                                      }}
                                      className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-[9px] text-slate-600 border border-slate-200 rounded font-semibold"
                                    >
                                      +{pType}
                                    </button>
                                  ))}
                                  {/* Historial */}
                                  {historicalMachines.length > 0 && (
                                    <>
                                      <span className="text-[9px] text-slate-300 self-center">|</span>
                                      {historicalMachines.slice(0, 3).map((mCode) => (
                                        <button
                                          key={mCode}
                                          type="button"
                                          onClick={() => updateMachine(maq.id, "codigo", mCode)}
                                          className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-[9px] text-slate-800 border border-slate-250 rounded font-semibold"
                                        >
                                          {mCode}
                                        </button>
                                      ))}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-550 uppercase">Horas Op:</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="Op"
                                  value={maq.horasOperativas}
                                  onChange={(e) => updateMachine(maq.id, "horasOperativas", parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 text-center font-bold"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-bold text-slate-550 uppercase">Horas Stby:</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="Stby"
                                  value={maq.horasStandby}
                                  onChange={(e) => updateMachine(maq.id, "horasStandby", parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 text-center font-bold"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMachine(maq.id)}
                                className="text-slate-400 hover:text-red-650 ml-auto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {needsJustification && (
                              <div className="space-y-2 border-t border-slate-250 pt-2.5 mt-2">
                                <label className="text-[10px] text-amber-600 font-black block uppercase tracking-wider">
                                  * Motivo del Standby (Selecciona una opción):
                                </label>
                                
                                <div className="flex flex-wrap gap-1">
                                  {STANDBY_PRESETS.map((reason) => {
                                    const isSelected = maq.justificacion === reason;
                                    return (
                                      <button
                                        key={reason}
                                        type="button"
                                        onClick={() => updateMachine(maq.id, "justificacion", reason)}
                                        className={`px-2.5 py-1 rounded text-[10px] border transition-all ${
                                          isSelected
                                            ? 'border-amber-500 bg-amber-550 text-slate-950 font-black'
                                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                        }`}
                                      >
                                        {reason}
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() => updateMachine(maq.id, "justificacion", "Otro")}
                                    className={`px-2.5 py-1 rounded text-[10px] border transition-all ${
                                      maq.justificacion === "Otro" || (!STANDBY_PRESETS.includes(maq.justificacion || "") && maq.justificacion !== "")
                                        ? 'border-amber-500 bg-amber-550 text-slate-950 font-black'
                                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                                    }`}
                                  >
                                    ✏️ Otro motivo
                                  </button>
                                </div>

                                {(maq.justificacion === "Otro" || (!STANDBY_PRESETS.includes(maq.justificacion || "") && maq.justificacion !== "")) && (
                                  <input
                                    type="text"
                                    placeholder="Escribe la justificación manualmente..."
                                    value={maq.justificacion === "Otro" ? "" : maq.justificacion || ""}
                                    onChange={(e) => updateMachine(maq.id, "justificacion", e.target.value)}
                                    className={`w-full px-3 py-1.5 bg-white border rounded-md text-xs text-slate-900 focus:ring-1 transition-all ${
                                      isJustificationMissing 
                                        ? 'border-amber-500 focus:border-amber-650 focus:ring-amber-500' 
                                        : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
                                    }`}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
