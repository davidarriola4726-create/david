import React, { useState } from 'react';
import { AlertStatus, ServiceRecord, Vehicle } from '../types';
import { calculateRecordStatus, formatCurrency, formatKm, getStatusBadge, getVehicleOverallStatus } from '../utils/helpers';
import { Car, Search, Gauge, Wrench, Calendar, Plus, FolderOpen, User, AlertCircle, Edit, Trash2 } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  records: ServiceRecord[];
  onSelectVehicleFicha: (vehicle: Vehicle) => void;
  onOpenNewVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (placa: string) => void;
  onQuickUpdateKm: (vehicle: Vehicle) => void;
  onAddServiceRecordForVehicle: (placa: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  records,
  onSelectVehicleFicha,
  onOpenNewVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onQuickUpdateKm,
  onAddServiceRecordForVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');

  const filteredVehicles = vehicles.filter((v) => {
    const status = getVehicleOverallStatus(v, records);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    const matchesSearch =
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.asignadoA.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por placa, marca, modelo o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({vehicles.length})
          </button>
          <button
            onClick={() => setStatusFilter('al_dia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'al_dia'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🟢 Al Día
          </button>
          <button
            onClick={() => setStatusFilter('proximo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'proximo'
                ? 'bg-amber-950 text-amber-400 border border-amber-700'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🟡 Próximos
          </button>
          <button
            onClick={() => setStatusFilter('vencido')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'vencido'
                ? 'bg-red-950 text-red-400 border border-red-700'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🔴 Vencidos
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={onOpenNewVehicle}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Vehículo</span>
        </button>
      </div>

      {/* Grid of Vehicle Cards */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Car className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-200">No se encontraron vehículos</h3>
          <p className="text-xs text-slate-400 mt-1">Intente cambiando el término de búsqueda o agregue un nuevo vehículo por placa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredVehicles.map((vehicle) => {
            const vehicleRecords = records.filter((r) => r.placa === vehicle.placa);
            const overallStatus = getVehicleOverallStatus(vehicle, records);
            const badge = getStatusBadge(overallStatus);

            const totalSpent = vehicleRecords.reduce((sum, r) => sum + r.precioTotal, 0);

            // Find nearest upcoming/overdue record for quick alert preview
            const urgentRecord = vehicleRecords.find(
              (r) => calculateRecordStatus(r, vehicle) === 'vencido' || calculateRecordStatus(r, vehicle) === 'proximo'
            );

            return (
              <div
                key={vehicle.placa}
                className={`group relative bg-slate-900/90 rounded-2xl border transition-all duration-200 hover:shadow-2xl overflow-hidden flex flex-col justify-between ${
                  overallStatus === 'vencido'
                    ? 'border-red-900/80 shadow-red-950/20 ring-1 ring-red-500/20'
                    : overallStatus === 'proximo'
                    ? 'border-amber-900/80 shadow-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Status Bar Banner */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Placa Badge */}
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-lg font-black tracking-widest text-white shadow-inner flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {vehicle.placa}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${badge.colorClass}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${badge.bgDot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Actions dropdown or edit */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditVehicle(vehicle)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Editar vehículo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteVehicle(vehicle.placa)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Eliminar vehículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-extrabold text-white group-hover:text-red-400 transition">
                      {vehicle.marca} {vehicle.modelo}{' '}
                      <span className="text-sm font-normal text-slate-400">({vehicle.anio})</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {vehicle.asignadoA}
                      </span>
                      {vehicle.color && <span>• Color: {vehicle.color}</span>}
                      <span>• Combustible: {vehicle.tipoCombustible}</span>
                    </div>
                  </div>

                  {/* Mileage & Financial Stats Box */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                        <Gauge className="w-3.5 h-3.5 text-blue-400" />
                        Kilometraje Actual
                      </div>
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        {formatKm(vehicle.kilometrajeActual)}
                        <button
                          onClick={() => onQuickUpdateKm(vehicle)}
                          className="text-[10px] text-red-400 hover:underline hover:text-red-300 font-normal"
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                        <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                        Gasto Acumulado
                      </div>
                      <div className="text-base font-bold text-emerald-400">
                        {formatCurrency(totalSpent)}
                      </div>
                    </div>
                  </div>

                  {/* Urgent Alert Banner Preview if present */}
                  {urgentRecord && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 mb-2 ${
                        calculateRecordStatus(urgentRecord, vehicle) === 'vencido'
                          ? 'bg-red-950/40 border-red-800/80 text-red-300'
                          : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px] block">
                          Alerta: {urgentRecord.titulo}
                        </span>
                        <span className="text-[11px] block text-slate-300">
                          {urgentRecord.proximaFecha ? `Fecha: ${urgentRecord.proximaFecha}` : ''}
                          {urgentRecord.proximoKilometraje ? ` | Límite: ${formatKm(urgentRecord.proximoKilometraje)}` : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subfolder Button Action Footer */}
                <div className="bg-slate-950/80 px-5 py-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{vehicleRecords.length}</span> registros en historial
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddServiceRecordForVehicle(vehicle.placa)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      title="Agregar servicio a este vehículo"
                    >
                      + Servicio
                    </button>
                    <button
                      onClick={() => onSelectVehicleFicha(vehicle)}
                      className="px-4 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-md shadow-red-950/50"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Abrir Ficha</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
