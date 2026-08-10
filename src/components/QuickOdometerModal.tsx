import React, { useState } from 'react';
import { Vehicle } from '../types';
import { X, Gauge, CheckCircle } from 'lucide-react';

interface QuickOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onUpdateMileage: (placa: string, newKm: number) => void;
}

export const QuickOdometerModal: React.FC<QuickOdometerModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onUpdateMileage,
}) => {
  const [newKm, setNewKm] = useState<number>(vehicle?.kilometrajeActual || 0);

  React.useEffect(() => {
    if (vehicle) setNewKm(vehicle.kilometrajeActual);
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKm < vehicle.kilometrajeActual) {
      if (!confirm(`El nuevo kilometraje (${newKm} km) es menor que el actual (${vehicle.kilometrajeActual} km). ¿Desea actualizar de todos modos?`)) {
        return;
      }
    }
    onUpdateMileage(vehicle.placa, Number(newKm));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-white">Actualizar Kilometraje</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Vehículo Seleccionado</div>
            <div className="text-base font-black text-white font-mono">{vehicle.placa}</div>
            <div className="text-xs text-slate-300">
              {vehicle.marca} {vehicle.modelo} ({vehicle.anio})
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Kilometraje registrado previo:{' '}
              <span className="font-bold text-slate-200">{vehicle.kilometrajeActual.toLocaleString()} km</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nuevo Lectura del Odiómetro (km) *
            </label>
            <input
              type="number"
              value={newKm}
              onChange={(e) => setNewKm(Number(e.target.value))}
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-950/50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar Lectura</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
