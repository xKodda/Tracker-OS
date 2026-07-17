import { HardHat, Camera, Upload, FileCheck } from "lucide-react";
import { fileToBase64, compressImage } from "../../utils/imageHelper";

interface StepGeneralInfoProps {
  fecha: string;
  setFecha: (val: string) => void;
  capataz: string;
  setCapataz: (val: string) => void;
  frenteTrabajo: string;
  setFrenteTrabajo: (val: string) => void;
  hptPhoto: string | null;
  setHptPhoto: (val: string | null) => void;
  hptPhotoName: string | null;
  setHptPhotoName: (val: string | null) => void;
  historicalCapataces: string[];
  historicalFrentes: string[];
  triggerSaveDraft: (
    fecha?: string,
    capataz?: string,
    frenteTrabajo?: string,
    hptPhoto?: string | null,
    hptPhotoName?: string | null
  ) => void;
}

export default function StepGeneralInfo({
  fecha,
  setFecha,
  capataz,
  setCapataz,
  frenteTrabajo,
  setFrenteTrabajo,
  hptPhoto,
  setHptPhoto,
  hptPhotoName,
  setHptPhotoName,
  historicalCapataces,
  historicalFrentes,
  triggerSaveDraft
}: StepGeneralInfoProps) {

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

  return (
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
          
          <div className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-55 text-center hover:border-slate-400 transition-colors">
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
                    className="font-extrabold text-red-650 hover:text-red-500 uppercase tracking-wider text-[10px]"
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
  );
}
