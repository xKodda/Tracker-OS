import { Camera, Upload, Trash2 } from "lucide-react";
import { PhotoAvance } from "../../types";

interface StepPhotosProps {
  fotosAvance: PhotoAvance[];
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updatePhotoDesc: (id: string, field: keyof PhotoAvance, value: string) => void;
  removePhoto: (id: string) => void;
}

export default function StepPhotos({
  fotosAvance,
  handlePhotoUpload,
  updatePhotoDesc,
  removePhoto
}: StepPhotosProps) {
  return (
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
              <div key={f.id} className="rounded-xl border border-slate-200 bg-slate-55 overflow-hidden flex flex-col shadow-sm">
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
  );
}
