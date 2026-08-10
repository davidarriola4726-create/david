import React, { useRef } from 'react';
import { ServiceRecord, Vehicle } from '../types';
import { Database, Download, Upload, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface DataSettingsProps {
  vehicles: Vehicle[];
  records: ServiceRecord[];
  onImportData: (vehicles: Vehicle[], records: ServiceRecord[]) => void;
  onResetData: () => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({
  vehicles,
  records,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      vehicles,
      records,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantenimiento_vehiculos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.vehicles && parsed.records && Array.isArray(parsed.vehicles) && Array.isArray(parsed.records)) {
          onImportData(parsed.vehicles, parsed.records);
          alert(`¡Respaldo importado con éxito! Se cargaron ${parsed.vehicles.length} vehículos y ${parsed.records.length} registros.`);
        } else {
          alert('El archivo no tiene la estructura válida de respaldo de vehículos.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">GESTIÓN Y RESPALDO DE DATOS LOCALES</h2>
            <p className="text-xs text-slate-400">
              Todos sus datos se guardan automáticamente en su navegador (LocalStorage)
            </p>
          </div>
        </div>

        {/* Current Data Status Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">Almacenamiento Local Activo</div>
              <div className="text-xs text-slate-400">
                Guardados actualmente: <strong className="text-slate-200">{vehicles.length} vehículos</strong> y{' '}
                <strong className="text-slate-200">{records.length} registros de mantenimiento</strong>.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            Seguro &amp; Privado
          </span>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-center flex flex-col justify-between">
            <div>
              <Download className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm">Exportar Respaldo JSON</h3>
              <p className="text-xs text-slate-400 mt-1">
                Descargue un archivo de copia de seguridad con todos sus vehículos, reparaciones, repuestos y facturas.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-950/40"
            >
              Exportar Copia (.json)
            </button>
          </div>

          {/* Import */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-center flex flex-col justify-between">
            <div>
              <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm">Restaurar / Importar</h3>
              <p className="text-xs text-slate-400 mt-1">
                Cargue un archivo `.json` exportado previamente para restaurar sus fichas técnicas.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/40"
            >
              Cargar Archivo JSON
            </button>
          </div>

          {/* Reset */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-center flex flex-col justify-between">
            <div>
              <RotateCcw className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm">Cargar Datos de Ejemplo</h3>
              <p className="text-xs text-slate-400 mt-1">
                Reiniciar la base de datos con información demostrativa de flota y mantenimiento automotriz.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Está seguro de reiniciar los datos a la demostración inicial? Se sobrescribirán los cambios actuales.')) {
                  onResetData();
                }
              }}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
            >
              Cargar Datos Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
