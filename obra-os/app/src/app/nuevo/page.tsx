"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReports } from "../../hooks/useReports";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Camera, 
  Check, 
  Info, 
  HardHat, 
  UserPlus, 
  Truck, 
  FileCheck,
  Send,
  Copy
} from "lucide-react";
import { DailyReport, Activity, WorkerHours, MachineHours, PhotoAvance } from "../../types";

// Helper para convertir archivo a Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper para comprimir imágenes y evitar saturar localStorage
const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 600): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7)); // Compresión a calidad 70%
    };
    img.onerror = () => {
      resolve(base64Str); // Fallback en caso de error
    };
  });
};

export default function NuevoReporte() {
  const router = useRouter();
  const { draft, saveDraft, saveReport, clearDraft } = useReports();
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
      // Obtener fecha local YYYY-MM-DD
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

  // Manejo de carga de HPT
  const handleHptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const compressed = await compressImage(base64);
      setHptPhoto(compressed);
      setHptPhotoName(file.name);
      triggerSaveDraft(fecha, capataz, frenteTrabajo, compressed, file.name);
    } catch (err) {
      console.error("Error al cargar la HPT:", err);
      alert("Error al procesar la imagen de la HPT.");
    }
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
    // Eliminar también recursos asociados a esa actividad
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

  // --- TEXTO WHATSAPP (Paso 5) ---
  const getWhatsAppMessageText = () => {
    const totalHoursMan = manoObra.reduce((acc, curr) => acc + curr.horas, 0);
    const totalHoursMachine = maquinaria.reduce((acc, curr) => acc + curr.horasOperativas + curr.horasStandby, 0);
    
    let text = `*CIERRE DIARIO DE OBRA* 🏗️\n`;
    text += `*Fecha:* ${fecha}\n`;
    text += `*Capataz:* ${capataz || 'No especificado'}\n`;
    text += `*Frente de Trabajo:* ${frenteTrabajo || 'No especificado'}\n\n`;
    
    text += `*1. ACTIVIDADES EJECUTADAS*:\n`;
    if (actividades.length === 0) text += `_Sin actividades registradas_\n`;
    actividades.forEach((act) => {
      const pks = act.pkInicio || act.pkFin ? ` (PK: ${act.pkInicio || ''} - ${act.pkFin || ''})` : '';
      text += `- ${act.descripcion || 'Sin descripción'}${pks}: *${act.horas} hrs*\n`;
    });
    text += `\n`;
    
    text += `*2. RECURSOS Y HORAS MANO DE OBRA*:\n`;
    if (manoObra.length === 0) text += `_Sin mano de obra registrada_\n`;
    manoObra.forEach((mo) => {
      const act = actividades.find(a => a.id === mo.actividadId)?.descripcion || 'Actividad';
      const just = mo.justificacion ? ` (Nota: ${mo.justificacion})` : '';
      text += `- ${mo.nombre || 'Sin nombre'}: *${mo.horas} hrs* en "${act}"${just}\n`;
    });
    text += `Total Horas Hombre: *${totalHoursMan} HH*\n\n`;
    
    text += `*3. RECURSOS Y HORAS MAQUINARIA*:\n`;
    if (maquinaria.length === 0) text += `_Sin maquinaria registrada_\n`;
    maquinaria.forEach((maq) => {
      const act = actividades.find(a => a.id === maq.actividadId)?.descripcion || 'Actividad';
      const standby = maq.horasStandby > 0 ? ` [Standby: ${maq.horasStandby} hrs]` : '';
      const just = maq.justificacion ? ` (Justificación: ${maq.justificacion})` : '';
      text += `- ${maq.codigo || 'Sin código'}: *${maq.horasOperativas} hrs* operativas${standby} en "${act}"${just}\n`;
    });
    text += `Total Horas Máquina: *${totalHoursMachine} HM*\n\n`;
    
    if (hptPhoto) {
      text += `✓ *HPT firmada adjunta en dispositivo.*\n`;
    }
    if (fotosAvance.length > 0) {
      text += `✓ *Fotografías de avance tomadas:* ${fotosAvance.length} fotos.\n`;
    }
    
    text += `\n_Generado automáticamente por Obra-OS_`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getWhatsAppMessageText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const formatted = getWhatsAppMessageText();
    const url = `https://wa.me/?text=${encodeURIComponent(formatted)}`;
    window.open(url, "_blank");
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
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Formulario */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => {
              if (confirm("¿Volver al panel? Tus cambios quedarán guardados como borrador local.")) {
                router.push("/");
              }
            }}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <span className="text-sm font-bold text-slate-200">Nuevo Cierre Diario</span>
          <span className="text-xs font-semibold text-slate-500">Paso {step} de 5</span>
        </div>
      </header>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-900 h-1">
        <div 
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      {/* Main Content Form */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:px-6 pb-32">
        
        {/* PASO 1: INFORMACIÓN GENERAL Y HPT */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-150 flex items-center gap-2">
                <HardHat className="h-5 w-5 text-indigo-400" />
                Información General
              </h2>
              <p className="text-xs text-slate-400">Identifica la jornada y el frente de trabajo actual en terreno.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fecha" className="text-xs font-semibold text-slate-400 block">Fecha</label>
                  <input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={(e) => {
                      setFecha(e.target.value);
                      triggerSaveDraft(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="capataz" className="text-xs font-semibold text-slate-400 block">Capataz Responsable</label>
                  <input
                    type="text"
                    id="capataz"
                    placeholder="Escribe tu nombre completo"
                    value={capataz}
                    onChange={(e) => {
                      setCapataz(e.target.value);
                      triggerSaveDraft(fecha, e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all placeholder-slate-650 text-slate-250"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="frente" className="text-xs font-semibold text-slate-400 block">Frente de Trabajo / Ubicación (PK)</label>
                <input
                  type="text"
                  id="frente"
                  placeholder="Ej: Puente Río Claro, PK 45+200, Tranchera B"
                  value={frenteTrabajo}
                  onChange={(e) => {
                    setFrenteTrabajo(e.target.value);
                    triggerSaveDraft(fecha, capataz, e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all placeholder-slate-650 text-slate-250"
                />
              </div>

              <div className="space-y-2 border-t border-slate-900 pt-6">
                <label className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  Cargar Foto de la HPT Firmada
                </label>
                
                <div className="mt-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 text-center hover:border-slate-700 transition-colors">
                  {hptPhoto ? (
                    <div className="space-y-4 w-full max-w-md">
                      <div className="aspect-video relative rounded-xl overflow-hidden border border-slate-850 bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={hptPhoto} alt="HPT Cargada" className="object-cover w-full h-full" />
                      </div>
                      <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-xl border border-slate-850 text-xs">
                        <span className="text-slate-400 font-medium truncate max-w-[200px]">{hptPhotoName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setHptPhoto(null);
                            setHptPhotoName(null);
                            triggerSaveDraft(fecha, capataz, frenteTrabajo, null, null);
                          }}
                          className="font-bold text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center gap-3">
                        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5">
                          <Camera className="h-4 w-4" /> Tomar Foto HPT
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleHptUpload}
                            className="hidden"
                          />
                        </label>
                        <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                          <Upload className="h-4 w-4" /> Seleccionar Archivo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHptUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">
                        Se recomienda fotografiar la HPT completa y legible con las firmas operativas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: ACTIVIDADES DIARIAS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-150 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-indigo-400" />
                  Actividades Ejecutadas
                </h2>
                <p className="text-xs text-slate-400">Declara las tareas realizadas durante el día y el tiempo estimado.</p>
              </div>
              <button
                type="button"
                onClick={addActivity}
                className="text-xs font-bold px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>

            {actividades.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-900 bg-slate-950 p-8 text-center text-slate-500">
                <Info className="h-6 w-6 mx-auto mb-2 text-slate-655" />
                <p className="text-xs font-semibold">No has agregado ninguna actividad aún.</p>
                <p className="text-xs text-slate-600 mt-1">Haz clic en "Agregar" para registrar el trabajo de hoy.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividades.map((act, index) => (
                  <div 
                    key={act.id} 
                    className="p-4 rounded-2xl bg-slate-900/30 border border-slate-900 relative space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">Actividad #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeActivity(act.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-455">Descripción de la Actividad</label>
                        <input
                          type="text"
                          placeholder="Ej: Hormigonado de fundaciones, excavación de zanja para canal"
                          value={act.descripcion}
                          onChange={(e) => updateActivity(act.id, "descripcion", e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-455">Horas Actividad</label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={act.horas}
                            onChange={(e) => updateActivity(act.id, "horas", parseFloat(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-455">PK Inicio</label>
                          <input
                            type="text"
                            placeholder="Ej: 12+340"
                            value={act.pkInicio || ""}
                            onChange={(e) => updateActivity(act.id, "pkInicio", e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-455">PK Fin</label>
                          <input
                            type="text"
                            placeholder="Ej: 12+450"
                            value={act.pkFin || ""}
                            onChange={(e) => updateActivity(act.id, "pkFin", e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: DISTRIBUCIÓN Y JUSTIFICACIÓN DE RECURSOS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-150 flex items-center gap-2">
                <HardHat className="h-5 w-5 text-indigo-400" />
                Mano de Obra y Maquinaria
              </h2>
              <p className="text-xs text-slate-400">Distribuye el personal y maquinarias asignándolos a cada actividad.</p>
            </div>

            {actividades.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-900 bg-slate-950 p-8 text-center text-slate-500">
                <p className="text-xs font-semibold">Primero debes definir actividades en el Paso 2.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {actividades.map((act) => {
                  const workersForAct = manoObra.filter((mo) => mo.actividadId === act.id);
                  const machinesForAct = maquinaria.filter((maq) => maq.actividadId === act.id);

                  return (
                    <div key={act.id} className="p-5 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-4">
                      {/* Cabecera Actividad */}
                      <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-200 text-sm">{act.descripcion || "Actividad sin descripción"}</h3>
                          <p className="text-xs text-slate-500">Horas declaradas: {act.horas} hrs</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-950/40 text-indigo-400 rounded-lg border border-indigo-900/40">Actividad</span>
                      </div>

                      {/* Mano de Obra */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            Mano de Obra ({workersForAct.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => addWorker(act.id)}
                            className="text-xs font-semibold px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-400 rounded-lg border border-slate-850 flex items-center gap-0.5"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Agregar Trabajador
                          </button>
                        </div>

                        {workersForAct.length > 0 && (
                          <div className="space-y-2">
                            {workersForAct.map((mo) => (
                              <div key={mo.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                                <div className="md:col-span-6">
                                  <input
                                    type="text"
                                    placeholder="Nombre del trabajador"
                                    value={mo.nombre}
                                    onChange={(e) => updateWorker(mo.id, "nombre", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    placeholder="HH"
                                    value={mo.horas}
                                    onChange={(e) => updateWorker(mo.id, "horas", parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-250 text-center"
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <input
                                    type="text"
                                    placeholder="Nota / Justificación (opc)"
                                    value={mo.justificacion || ""}
                                    onChange={(e) => updateWorker(mo.id, "justificacion", e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-300"
                                  />
                                </div>
                                <div className="md:col-span-1 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => removeWorker(mo.id)}
                                    className="text-slate-600 hover:text-red-400"
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
                      <div className="space-y-3 pt-3 border-t border-slate-900/60">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            Maquinaria ({machinesForAct.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => addMachine(act.id)}
                            className="text-xs font-semibold px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-400 rounded-lg border border-slate-850 flex items-center gap-0.5"
                          >
                            <Truck className="h-3.5 w-3.5" /> Agregar Máquina
                          </button>
                        </div>

                        {machinesForAct.length > 0 && (
                          <div className="space-y-2.5">
                            {machinesForAct.map((maq) => {
                              const needsJustification = maq.horasStandby > 0;
                              const isJustificationMissing = needsJustification && !maq.justificacion?.trim();

                              return (
                                <div 
                                  key={maq.id} 
                                  className={`p-3.5 rounded-xl bg-slate-950/60 border transition-all ${isJustificationMissing ? 'border-amber-900/60 bg-amber-950/5' : 'border-slate-900'} space-y-3`}
                                >
                                  <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex-1 min-w-[200px]">
                                      <input
                                        type="text"
                                        placeholder="Código / Descripción (Ej: Excavadora CAT-01)"
                                        value={maq.codigo}
                                        onChange={(e) => updateMachine(maq.id, "codigo", e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 font-medium"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="text-[10px] text-slate-500 font-semibold uppercase">Op:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="Horas Op"
                                        value={maq.horasOperativas}
                                        onChange={(e) => updateMachine(maq.id, "horasOperativas", parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-250 text-center"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="text-[10px] text-slate-500 font-semibold uppercase">Stby:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="Horas Stby"
                                        value={maq.horasStandby}
                                        onChange={(e) => updateMachine(maq.id, "horasStandby", parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-250 text-center"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeMachine(maq.id)}
                                      className="text-slate-600 hover:text-red-400 ml-auto"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {needsJustification && (
                                    <div className="space-y-1">
                                      <label className="text-[10px] text-amber-300 font-semibold block">
                                        * Justificación del tiempo en Standby (Obligatoria):
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Escribe por qué la máquina estuvo parada (ej. Falla mecánica, falta de material)"
                                        value={maq.justificacion || ""}
                                        onChange={(e) => updateMachine(maq.id, "justificacion", e.target.value)}
                                        className={`w-full px-3 py-1.5 bg-slate-900 border rounded-lg text-xs text-slate-200 focus:ring-1 transition-all ${
                                          isJustificationMissing 
                                            ? 'border-amber-850 focus:border-amber-500 focus:ring-amber-500' 
                                            : 'border-slate-850 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                      />
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
        )}

        {/* PASO 4: REGISTRO FOTOGRÁFICO DE AVANCE */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-150 flex items-center gap-2">
                <Camera className="h-5 w-5 text-indigo-400" />
                Fotografías de Avance
              </h2>
              <p className="text-xs text-slate-400">Adjunta imágenes tomadas en terreno para documentar visualmente el progreso.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-3 p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 text-center hover:border-slate-700 transition-colors">
                <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5">
                  <Camera className="h-4 w-4" /> Tomar Fotos (Cámara)
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Upload className="h-4 w-4" /> Subir Archivos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {fotosAvance.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fotosAvance.map((f) => (
                    <div key={f.id} className="rounded-xl border border-slate-900 bg-slate-900/30 overflow-hidden flex flex-col">
                      <div className="aspect-video relative bg-slate-950 border-b border-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.photo} alt={f.photoName} className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removePhoto(f.id)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-850"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="p-3.5 space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase block">Ubicación / Punto Kilométrico (PK)</label>
                          <input
                            type="text"
                            placeholder="Ej: PK 12+350 o Frente Norte"
                            value={f.pk || ""}
                            onChange={(e) => updatePhotoDesc(f.id, "pk", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase block">Breve Descripción</label>
                          <input
                            type="text"
                            placeholder="Ej: Terminación de enfierradura en pilote 3"
                            value={f.descripcion}
                            onChange={(e) => updatePhotoDesc(f.id, "descripcion", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 5: VISTA PREVIA Y ENVÍO */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-150 flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-400" />
                Resumen y Envío
              </h2>
              <p className="text-xs text-slate-400">Revisa la información consolidada del día y envíala a través de WhatsApp.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400">Mensaje de WhatsApp Generado</label>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="text-xs font-semibold px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-lg flex items-center gap-1 active:scale-[0.98] transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "¡Copiado!" : "Copiar Texto"}
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all max-h-[40vh] overflow-y-auto">
                  {getWhatsAppMessageText()}
                </div>
              </div>

              {/* Notas informativas sobre archivos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl flex items-start gap-2.5">
                  <div className="bg-emerald-950 text-emerald-400 p-1.5 rounded-lg border border-emerald-900/50 mt-0.5">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-350 block">HPT Firmada</span>
                    <span className="text-[10px] text-slate-500">
                      {hptPhoto ? "✓ Guardada en borrador de este dispositivo." : "⚠ No se ha subido foto de HPT."}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl flex items-start gap-2.5">
                  <div className="bg-indigo-950 text-indigo-400 p-1.5 rounded-lg border border-indigo-900/50 mt-0.5">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-350 block">Registro Fotográfico</span>
                    <span className="text-[10px] text-slate-500">
                      {fotosAvance.length > 0 ? `✓ ${fotosAvance.length} fotos guardadas localmente.` : "⚠ No se han agregado fotos de avance."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón enviar por WhatsApp */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 group transition-all"
              >
                <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                Enviar a WhatsApp del Secretario Técnico
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Fijo del Formulario */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-900 bg-slate-950/90 backdrop-blur-md py-4 px-4 sm:px-6 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 disabled:opacity-0 transition-all flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Anterior
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFinalize}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 rounded-xl text-xs font-bold border border-slate-800 hover:text-indigo-300 transition-all flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Guardar Borrador
            </button>
            
            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  // Validaciones sencillas por paso antes de avanzar
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
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1"
              >
                Siguiente <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Finalizar y Cerrar
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
