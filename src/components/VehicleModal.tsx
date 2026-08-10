import React, { useState } from 'react';
import { Vehicle } from '../types';
import { X, Car, Gauge, User, Tag, FileText } from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
  existingVehicle?: Vehicle;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, onSave, existingVehicle }) => {
  const [placa, setPlaca] = useState<string>(existingVehicle?.placa || '');
  const [marca, setMarca] = useState<string>(existingVehicle?.marca || '');
  const [modelo, setModelo] = useState<string>(existingVehicle?.modelo || '');
  const [anio, setAnio] = useState<number>(existingVehicle?.anio || new Date().getFullYear());
  const [kilometrajeActual, setKilometrajeActual] = useState<number>(existingVehicle?.kilometrajeActual || 0);
  const [tipoCombustible, setTipoCombustible] = useState<Vehicle['tipoCombustible']>(
    existingVehicle?.tipoCombustible || 'Gasolina'
  );
  const [asignadoA, setAsignadoA] = useState<string>(existingVehicle?.asignadoA || '');
  const [color, setColor] = useState<string>(existingVehicle?.color || '');
  const [vin, setVin] = useState<string>(existingVehicle?.vin || '');
  const [notas, setNotas] = useState<string>(existingVehicle?.notas || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !marca.trim() || !modelo.trim()) {
      alert('Por favor complete los campos requeridos: Placa, Marca y Modelo.');
      return;
    }

    const vehicleData: Vehicle = {
      placa: placa.trim().toUpperCase(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      anio: Number(anio) || new Date().getFullYear(),
      kilometrajeActual: Number(kilometrajeActual) || 0,
      tipoCombustible,
      asignadoA: asignadoA.trim() || 'No asignado',
      color: color.trim() || undefined,
      vin: vin.trim() || undefined,
      notas: notas.trim() || undefined,
      creadoEn: existingVehicle?.creadoEn || new Date().toISOString().split('T')[0],
    };

    onSave(vehicleData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {existingVehicle ? `Editar Vehículo ${existingVehicle.placa}` : 'Alta de Nuevo Vehículo'}
              </h2>
              <p className="text-xs text-slate-400">Creación de ficha/subcarpeta propia por placa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-red-400" />
                Número de Placa *
              </label>
              <input
                type="text"
                placeholder="Ej. P-842BKN / ABC-123"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                disabled={!!existingVehicle}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-red-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                Kilometraje Actual (km) *
              </label>
              <input
                type="number"
                placeholder="Ej. 85000"
                value={kilometrajeActual}
                onChange={(e) => setKilometrajeActual(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marca *</label>
              <input
                type="text"
                placeholder="Ej. Toyota / Nissan / Ford"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo *</label>
              <input
                type="text"
                placeholder="Ej. Hilux / NP300 / CR-V"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Año de Fabricación</label>
              <input
                type="number"
                min="1980"
                max="2030"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Combustible</label>
              <select
                value={tipoCombustible}
                onChange={(e) => setTipoCombustible(e.target.value as Vehicle['tipoCombustible'])}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="Gasolina">Gasolina</option>
                <option value="Diésel">Diésel</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Eléctrico">Eléctrico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Asignado a / Conductor / Área
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez - Logística"
                value={asignadoA}
                onChange={(e) => setAsignadoA(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Color del Vehículo</label>
              <input
                type="text"
                placeholder="Ej. Blanco / Gris Plata / Negro"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Número de Serie / VIN (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. 1HGCR2F83HA000000"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Especificaciones</label>
              <textarea
                rows={2}
                placeholder="Observaciones de uso, recomendaciones o detalles técnicos..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition shadow-lg shadow-red-950/50 flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>{existingVehicle ? 'Guardar Cambios' : 'Registrar Vehículo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
