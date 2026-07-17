import { useState, useEffect } from 'react';
import { DailyReport } from '../types';

const STORAGE_REPORTS_KEY = 'obra_os_reports';
const STORAGE_DRAFT_KEY = 'obra_os_current_draft';

export function useReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [draft, setDraft] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar reportes y borrador inicial desde localStorage (solo cliente)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedReports = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }

      const storedDraft = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (storedDraft) {
        setDraft(JSON.parse(storedDraft));
      }
    } catch (error) {
      console.error('Error al leer de localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar historial en localStorage
  const saveReportsList = (updatedReports: DailyReport[]) => {
    setReports(updatedReports);
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(updatedReports));
    } catch (error) {
      console.error('Error al guardar reportes:', error);
      alert('Error de almacenamiento local. Es posible que el almacenamiento esté lleno (límite de imágenes).');
    }
  };

  // Guardar borrador actual
  const saveDraft = (updatedDraft: DailyReport) => {
    setDraft(updatedDraft);
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(updatedDraft));
    } catch (error) {
      console.error('Error al guardar el borrador:', error);
    }
  };

  // Limpiar borrador actual
  const clearDraft = () => {
    setDraft(null);
    try {
      localStorage.removeItem(STORAGE_DRAFT_KEY);
    } catch (error) {
      console.error('Error al eliminar borrador:', error);
    }
  };

  // Guardar reporte finalizado
  const saveReport = (completedReport: DailyReport) => {
    const finalReport: DailyReport = {
      ...completedReport,
      status: 'completado',
      createdAt: new Date().toISOString(),
    };

    // Actualizar historial (si ya existe por ID, se sobrescribe; de lo contrario, se añade)
    const existingIndex = reports.findIndex((r) => r.id === finalReport.id);
    let updated: DailyReport[];

    if (existingIndex > -1) {
      updated = [...reports];
      updated[existingIndex] = finalReport;
    } else {
      updated = [finalReport, ...reports];
    }

    saveReportsList(updated);
    clearDraft();
  };

  // Eliminar reporte
  const deleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    saveReportsList(updated);
  };

  return {
    reports,
    draft,
    loading,
    saveDraft,
    clearDraft,
    saveReport,
    deleteReport,
  };
}
