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

const ACTIVIDADES_PRESETS = [
  { label: "Excavación", icon: "🏗️" },
  { label: "Carga y Transporte", icon: "🚛" },
  { label: "Compactación / Relleno", icon: "🚜" },
  { label: "Despeje y Escarpe", icon: "🌱" },
  { label: "Perfilado / Nivelación", icon: "📐" },
  { label: "Acopio de Material", icon: "🪵" },
];

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

export default function NuevoReporte() {
  const router = useRouter();
  const { 
    draft, 
    saveDraft, 
    saveReport, 
    clearDraft,
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
    <div className="flex-1 flex flex-col bg-slate-100 text-slate-900 min-h-screen">
      {/* Header Formulario - Estilo Industrial */}
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

      {/* Barra de progreso de Alta Visibilidad */}
      <div className="w-full bg-slate-200 h-1.5">
        <div 
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      {/* Main Content Form */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:px-6 pb-32">
        
        {/* PASO 1: INFORMACIÓN GENERAL Y HPT */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <HardHat className="h-5 w-5 text-amber-500" />
                1. Información General
              </h2>
              <p className="text-xs text-slate-500 font-medium">Registra la fecha, capataz a cargo y el frente de trabajo.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="fecha" className="text-xs font-bold text-slate-700 uppercase block">Fecha de la Jornada</label>
                  <input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={(e) => {
                      setFecha(e.target.value);
                      triggerSaveDraft(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-sm text-slate-900 shadow-sm"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="capataz" className="text-xs font-bold text-slate-700 uppercase block">Capataz Responsable</label>
                  <input
                    type="text"
                    id="capataz"
                    placeholder="Tu nombre y apellido"
                    value={capataz}
                    onChange={(e) => {
                      setCapataz(e.target.value);
                      triggerSaveDraft(fecha, e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-sm text-slate-900 shadow-sm"
                  />
                  {historicalCapataces.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[9px] text-slate-500 font-bold self-center">Recientes:</span>
                      {historicalCapataces.slice(0, 3).map((cap) => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => {
                            setCapataz(cap);
                            triggerSaveDraft(fecha, cap);
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 border border-slate-250 rounded-md transition-colors"
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="frente" className="text-xs font-bold text-slate-700 uppercase block">Frente de Trabajo / Punto Kilométrico (PK)</label>
                <input
                  type="text"
                  id="frente"
                  placeholder="Ej: Trinchera Norte, PK 24+400"
                  value={frenteTrabajo}
                  onChange={(e) => {
                    setFrenteTrabajo(e.target.value);
                    triggerSaveDraft(fecha, capataz, e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-sm text-slate-900 shadow-sm"
                />
                {historicalFrentes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-[9px] text-slate-500 font-bold self-center">Recientes:</span>
                    {historicalFrentes.slice(0, 3).map((frente) => (
                      <button
                        key={frente}
                        type="button"
                        onClick={() => {
                          setFrenteTrabajo(frente);
                          triggerSaveDraft(fecha, capataz, frente);
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 border border-slate-250 rounded-md transition-colors"
                      >
                        {frente}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-5 mt-5">
                <label className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                  <FileCheck className="h-4.5 w-4.5 text-emerald-600" />
                  Cargar Foto de la HPT Firmada
                </label>
                
                <div className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:border-slate-400 transition-colors">
                  {hptPhoto ? (
                    <div className="space-y-4 w-full max-w-md">
                      <div className="aspect-video relative rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={hptPhoto} alt="HPT Cargada" className="object-cover w-full h-full" />
                      </div>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <span className="text-slate-650 font-bold truncate max-w-[200px]">{hptPhotoName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setHptPhoto(null);
                            setHptPhotoName(null);
                            triggerSaveDraft(fecha, capataz, frenteTrabajo, null, null);
                          }}
                          className="font-extrabold text-red-600 hover:text-red-500 uppercase tracking-wider text-[10px]"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center gap-3">
                        <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white px-4 py-2.5 rounded-lg text-xs font-extrabold shadow flex items-center gap-1.5 uppercase tracking-wider">
                          <Camera className="h-4 w-4 text-amber-500" /> Tomar Foto HPT
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleHptUpload}
                            className="hidden"
                          />
                        </label>
                        <label className="cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-xs font-extrabold shadow flex items-center gap-1.5 uppercase tracking-wider">
                          <Upload className="h-4 w-4 text-slate-500" /> Seleccionar
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHptUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Fotografía completa la hoja HPT firmada por los operadores antes del inicio.
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
                        className="text-slate-400 hover:text-red-650 transition-colors"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 uppercase block">Tipo de Actividad (Movimiento de Tierra)</label>
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
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
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
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
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
        )}

        {/* PASO 3: DISTRIBUCIÓN Y JUSTIFICACIÓN DE RECURSOS */}
        {step === 3 && (
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
                        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200 uppercase tracking-wider">Actividad</span>
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
                                      <label className="text-[10px] font-bold text-slate-500 uppercase">Horas Op:</label>
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
                                      <label className="text-[10px] font-bold text-slate-500 uppercase">Horas Stby:</label>
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
                                      className="text-slate-400 hover:text-red-600 ml-auto"
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
                                              ? 'border-amber-500 focus:border-amber-600 focus:ring-amber-500' 
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
        )}

        {/* PASO 4: REGISTRO FOTOGRÁFICO DE AVANCE */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Camera className="h-5 w-5 text-amber-500" />
                4. Fotografías de Avance
              </h2>
              <p className="text-xs text-slate-500 font-medium">Adjunta imágenes tomadas en terreno para documentar visualmente el progreso.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:border-slate-400 transition-colors">
                <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white px-4 py-2.5 rounded-lg text-xs font-extrabold shadow flex items-center gap-1.5 uppercase tracking-wider">
                  <Camera className="h-4 w-4 text-amber-500" /> Tomar Fotos (Cámara)
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <label className="cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-xs font-extrabold shadow flex items-center gap-1.5 uppercase tracking-wider">
                  <Upload className="h-4 w-4 text-slate-550" /> Seleccionar
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
                    <div key={f.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col shadow-sm">
                      <div className="aspect-video relative bg-slate-200 border-b border-slate-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.photo} alt={f.photoName} className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removePhoto(f.id)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-600 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="p-3.5 space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-extrabold uppercase block">Ubicación / Punto Kilométrico (PK)</label>
                          <input
                            type="text"
                            placeholder="Ej: PK 12+350 o Frente Norte"
                            value={f.pk || ""}
                            onChange={(e) => updatePhotoDesc(f.id, "pk", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-extrabold uppercase block">Breve Descripción</label>
                          <input
                            type="text"
                            placeholder="Ej: Terminación de excavación canal"
                            value={f.descripcion}
                            onChange={(e) => updatePhotoDesc(f.id, "descripcion", e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
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
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" />
                5. Resumen y Envío
              </h2>
              <p className="text-xs text-slate-500 font-medium">Revisa el reporte consolidado e inicie la subida a WhatsApp.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 uppercase">Texto del Mensaje Generado</label>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="text-xs font-bold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg flex items-center gap-1 active:scale-[0.98] transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 animate-scale-up" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
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
        )}
      </main>

      {/* Footer Fijo del Formulario */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white py-4 px-4 sm:px-6 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 disabled:opacity-0 transition-all flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Anterior
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFinalize}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 uppercase"
            >
              <Save className="h-4 w-4 text-amber-500" /> Guardar Borrador
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
