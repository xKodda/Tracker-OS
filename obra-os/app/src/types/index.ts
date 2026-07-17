export interface Activity {
  id: string;
  descripcion: string;
  horas: number;
  pkInicio?: string;
  pkFin?: string;
}

export interface WorkerHours {
  id: string;
  nombre: string;
  horas: number;
  actividadId: string; // Relación con una actividad
  justificacion?: string;
}

export interface MachineHours {
  id: string;
  codigo: string; // Ej: Excavadora EX-02 o Patente
  horasOperativas: number;
  horasStandby: number;
  actividadId: string; // Relación con una actividad
  justificacion?: string; // Justificación obligatoria si hay standby
}

export interface PhotoAvance {
  id: string;
  photo: string; // Base64 data URL
  photoName: string;
  descripcion: string;
  pk?: string;
}

export interface DailyReport {
  id: string;
  fecha: string;
  capataz: string;
  frenteTrabajo: string;
  hptPhoto: string | null; // Base64 de la HPT firmada
  hptPhotoName: string | null;
  actividades: Activity[];
  recursos: {
    manoObra: WorkerHours[];
    maquinaria: MachineHours[];
  };
  fotosAvance: PhotoAvance[];
  createdAt: string;
  status: 'borrador' | 'completado';
}
