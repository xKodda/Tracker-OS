"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReports } from "../../hooks/useReports";
import { ArrowLeft, ArrowRight, Save, Check } from "lucide-react";
import { DailyReport, Activity, WorkerHours, MachineHours, PhotoAvance } from "../../types";
import { fileToBase64, compressImage } from "../../utils/imageHelper";
import { generateWhatsAppText, getWhatsAppURL } from "../../utils/whatsappHelper";

// Importar Pasos del Wizard
import StepGeneralInfo from "../../components/wizard/StepGeneralInfo";
import StepActivities from "../../components/wizard/StepActivities";
import StepResources from "../../components/wizard/StepResources";
import StepPhotos from "../../components/wizard/StepPhotos";
import StepPreview from "../../components/wizard/StepPreview";

export default function NuevoReporte() {
  const router = useRouter();
  const { 
    draft, 
    saveDraft, 
    saveReport, 
    historicalWorkers,
    historicalMachines,
    historicalCapataces,
    historicalFrentes
  } = useReports();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  // Estados del Formulario
  const [id, setId] = useState("");
  const [fecha, setFecha] = useState("");
  const [capataz, setCapataz] = useState("");
  const [frenteTrabajo, setFrenteTrabajo] = useState("");
  const [hptPhoto, setHptPhoto] = useState<string | null>(null);
  const [hptPhotoName, setHptPhotoName] = useState<string | null>(null);
  const [actividades, setActividades] = useState<Activity[]>([]);
  const [manoObra, setManoObra] = useState<WorkerHours[]>([]);
  const [maquinaria, setMaquinaria] = useState<MachineHours[]>([]);
  const [fotosAvance, setFotosAvance] = useState<PhotoAvance[]>([]);

  // Inicializar o cargar borrador
  useEffect(() => {
    if (draft) {
      setId(draft.id);
      setFecha(draft.fecha);
      setCapataz(draft.capataz);
      setFrenteTrabajo(draft.frenteTrabajo);
      setHptPhoto(draft.hptPhoto);
      setHptPhotoName(draft.hptPhotoName);
      setActividades(draft.actividades || []);
      setManoObra(draft.recursos?.manoObra || []);
      setMaquinaria(draft.recursos?.maquinaria || []);
      setFotosAvance(draft.fotosAvance || []);
    } else {
      setId(Math.random().toString(36).substring(2, 9));
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localDate = new Date(today.getTime() - (offset * 60 * 1000));
      setFecha(localDate.toISOString().split("T")[0]);
      setCapataz("");
      setFrenteTrabajo("");
      setHptPhoto(null);
      setHptPhotoName(null);
      setActividades([]);
      setManoObra([]);
      setMaquinaria([]);
      setFotosAvance([]);
    }
  }, [draft]);

  // Guardar borrador automáticamente al cambiar datos relevantes
  const triggerSaveDraft = (
    newFecha = fecha,
    newCapataz = capataz,
    newFrente = frenteTrabajo,
    newHpt = hptPhoto,
    newHptName = hptPhotoName,
    newActs = actividades,
    newMo = manoObra,
    newMaq = maquinaria,
    newFotos = fotosAvance
  ) => {
    if (!newFecha) return;
    const updatedDraft: DailyReport = {
      id,
      fecha: newFecha,
      capataz: newCapataz,
      frenteTrabajo: newFrente,
      hptPhoto: newHpt,
      hptPhotoName: newHptName,
      actividades: newActs,
      recursos: {
        manoObra: newMo,
        maquinaria: newMaq
      },
      fotosAvance: newFotos,
      createdAt: new Date().toISOString(),
      status: "borrador"
    };
    saveDraft(updatedDraft);
  };

  // --- MÉTODOS DE ACTIVIDADES (Paso 2) ---
  const addActivity = () => {
    const newAct: Activity = {
      id: Math.random().toString(36).substring(2, 9),
      descripcion: "",
      horas: 8,
      pkInicio: "",
      pkFin: ""
    };
    const updated = [...actividades, newAct];
    setActividades(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, updated);
  };

  const updateActivity = (id: string, field: keyof Activity, value: any) => {
    const updated = actividades.map((act) => {
      if (act.id === id) {
        return { ...act, [field]: value };
      }
      return act;
    });
    setActividades(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, updated);
  };

  const removeActivity = (actId: string) => {
    const updatedActs = actividades.filter((act) => act.id !== actId);
    const updatedMo = manoObra.filter((mo) => mo.actividadId !== actId);
    const updatedMaq = maquinaria.filter((maq) => maq.actividadId !== actId);
    
    setActividades(updatedActs);
    setManoObra(updatedMo);
    setMaquinaria(updatedMaq);
    
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, updatedActs, updatedMo, updatedMaq);
  };

  // --- MÉTODOS DE RECURSOS (Paso 3) ---
  const addWorker = (actividadId: string) => {
    const newWorker: WorkerHours = {
      id: Math.random().toString(36).substring(2, 9),
      nombre: "",
      horas: 8,
      actividadId,
      justificacion: ""
    };
    const updated = [...manoObra, newWorker];
    setManoObra(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, updated);
  };

  const updateWorker = (id: string, field: keyof WorkerHours, value: any) => {
    const updated = manoObra.map((mo) => {
      if (mo.id === id) {
        return { ...mo, [field]: value };
      }
      return mo;
    });
    setManoObra(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, updated);
  };

  const removeWorker = (id: string) => {
    const updated = manoObra.filter((mo) => mo.id !== id);
    setManoObra(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, updated);
  };

  const addMachine = (actividadId: string) => {
    const newMachine: MachineHours = {
      id: Math.random().toString(36).substring(2, 9),
      codigo: "",
      horasOperativas: 8,
      horasStandby: 0,
      actividadId,
      justificacion: ""
    };
    const updated = [...maquinaria, newMachine];
    setMaquinaria(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, manoObra, updated);
  };

  const updateMachine = (id: string, field: keyof MachineHours, value: any) => {
    const updated = maquinaria.map((maq) => {
      if (maq.id === id) {
        return { ...maq, [field]: value };
      }
      return maq;
    });
    setMaquinaria(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, manoObra, updated);
  };

  const removeMachine = (id: string) => {
    const updated = maquinaria.filter((maq) => maq.id !== id);
    setMaquinaria(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, manoObra, updated);
  };

  // --- MÉTODOS DE FOTOS (Paso 4) ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PhotoAvance[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await fileToBase64(file);
        const compressed = await compressImage(base64);
        newPhotos.push({
          id: Math.random().toString(36).substring(2, 9),
          photo: compressed,
          photoName: file.name,
          descripcion: "",
          pk: ""
        });
      } catch (err) {
        console.error("Error al procesar foto:", err);
      }
    }

    const updated = [...fotosAvance, ...newPhotos];
    setFotosAvance(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, manoObra, maquinaria, updated);
  };

  const updatePhotoDesc = (id: string, field: keyof PhotoAvance, value: string) => {
    const updated = fotosAvance.map((f) => {
      if (f.id === id) {
        return { ...f, [field]: value };
      }
      return f;
    });
    setFotosAvance(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, manoObra, maquinaria, updated);
  };

  const removePhoto = (id: string) => {
    const updated = fotosAvance.filter((f) => f.id !== id);
    setFotosAvance(updated);
    triggerSaveDraft(fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades, manoObra, maquinaria, updated);
  };

  const handleCopyText = () => {
    const report: DailyReport = {
      id, fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades,
      recursos: { manoObra, maquinaria }, fotosAvance, createdAt: "", status: "borrador"
    };
    navigator.clipboard.writeText(generateWhatsAppText(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const report: DailyReport = {
      id, fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades,
      recursos: { manoObra, maquinaria }, fotosAvance, createdAt: "", status: "borrador"
    };
    window.open(getWhatsAppURL(report), "_blank");
  };

  const handleFinalize = () => {
    if (!fecha || !capataz || !frenteTrabajo) {
      alert("Por favor completa la información general (Paso 1) antes de finalizar.");
      setStep(1);
      return;
    }
    if (actividades.length === 0) {
      alert("Debes registrar al menos una actividad.");
      setStep(2);
      return;
    }

    // Validar justificación de horas máquina en standby
    const hasInvalidStandby = maquinaria.some(m => m.horasStandby > 0 && !m.justificacion?.trim());
    if (hasInvalidStandby) {
      alert("Debes justificar los tiempos de Standby de la maquinaria (Paso 3).");
      setStep(3);
      return;
    }

    const report: DailyReport = {
      id,
      fecha,
      capataz,
      frenteTrabajo,
      hptPhoto,
      hptPhotoName,
      actividades,
      recursos: {
        manoObra,
        maquinaria
      },
      fotosAvance,
      createdAt: new Date().toISOString(),
      status: "completado"
    };

    saveReport(report);
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 text-slate-900 min-h-screen">
      {/* Header Formulario */}
      <header className="bg-slate-900 text-white shadow px-4 py-4 sm:px-6 border-b-4 border-amber-500 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => {
              if (confirm("¿Volver al panel? Tus cambios quedarán guardados como borrador local.")) {
                router.push("/");
              }
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-amber-500" /> PANEL PRINCIPAL
          </button>
          <span className="text-sm font-black uppercase tracking-wider text-slate-200">REGISTRO DE CIERRE DIARIO</span>
          <span className="text-xs font-extrabold text-amber-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">PASO {step}/5</span>
        </div>
      </header>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-200 h-1.5">
        <div 
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      {/* Renderizado de Pasos */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:px-6 pb-32">
        {step === 1 && (
          <StepGeneralInfo
            fecha={fecha}
            setFecha={setFecha}
            capataz={capataz}
            setCapataz={setCapataz}
            frenteTrabajo={frenteTrabajo}
            setFrenteTrabajo={setFrenteTrabajo}
            hptPhoto={hptPhoto}
            setHptPhoto={setHptPhoto}
            hptPhotoName={hptPhotoName}
            setHptPhotoName={setHptPhotoName}
            historicalCapataces={historicalCapataces}
            historicalFrentes={historicalFrentes}
            triggerSaveDraft={triggerSaveDraft}
          />
        )}
        
        {step === 2 && (
          <StepActivities
            actividades={actividades}
            addActivity={addActivity}
            updateActivity={updateActivity}
            removeActivity={removeActivity}
          />
        )}

        {step === 3 && (
          <StepResources
            actividades={actividades}
            manoObra={manoObra}
            maquinaria={maquinaria}
            addWorker={addWorker}
            updateWorker={updateWorker}
            removeWorker={removeWorker}
            addMachine={addMachine}
            updateMachine={updateMachine}
            removeMachine={removeMachine}
            historicalWorkers={historicalWorkers}
            historicalMachines={historicalMachines}
          />
        )}

        {step === 4 && (
          <StepPhotos
            fotosAvance={fotosAvance}
            handlePhotoUpload={handlePhotoUpload}
            updatePhotoDesc={updatePhotoDesc}
            removePhoto={removePhoto}
          />
        )}

        {step === 5 && (
          <StepPreview
            hptPhoto={hptPhoto}
            fotosAvance={fotosAvance}
            copied={copied}
            handleCopyText={handleCopyText}
            handleSendWhatsApp={handleSendWhatsApp}
            getWhatsAppMessageText={() => {
              const report: DailyReport = {
                id, fecha, capataz, frenteTrabajo, hptPhoto, hptPhotoName, actividades,
                recursos: { manoObra, maquinaria }, fotosAvance, createdAt: "", status: "borrador"
              };
              return generateWhatsAppText(report);
            }}
          />
        )}
      </main>

      {/* Footer Fijo */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white py-4 px-4 sm:px-6 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 bg-white hover:bg-slate-55 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 disabled:opacity-0 transition-all flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Anterior
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerSaveDraft as any}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 uppercase"
            >
              <Save className="h-4 w-4 text-amber-500" /> Guardar Borrador
            </button>
            
            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!fecha || !capataz || !frenteTrabajo)) {
                    alert("Completa la información general antes de avanzar.");
                    return;
                  }
                  if (step === 2 && actividades.length === 0) {
                    alert("Agrega al menos una actividad antes de continuar.");
                    return;
                  }
                  if (step === 3) {
                    const hasInvalidStandby = maquinaria.some(m => m.horasStandby > 0 && !m.justificacion?.trim());
                    if (hasInvalidStandby) {
                      alert("Por favor escribe la justificación obligatoria para la maquinaria en Standby.");
                      return;
                    }
                  }
                  setStep(step + 1);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1 uppercase"
              >
                Siguiente <ArrowRight className="h-4 w-4 text-amber-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Check className="h-4 w-4" /> Finalizar y Guardar
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
