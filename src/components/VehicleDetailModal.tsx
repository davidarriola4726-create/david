import React, { useState } from 'react';
import { ServiceRecord, ServiceType, Vehicle } from '../types';
import {
  calculateRecordStatus,
  formatCurrency,
  formatDateReadable,
  formatKm,
  getStatusBadge,
} from '../utils/helpers';
import {
  X,
  Wrench,
  Gauge,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Edit,
  Trash2,
  Tag,
  ShieldAlert,
} from 'lucide-react';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  records: ServiceRecord[];
  onOpenAddRecord: (placa: string) => void;
  onEditRecord: (record: ServiceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onQuickUpdateKm: (vehicle: Vehicle) => void;
  onMarkRecordCompleted: (record: ServiceRecord) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  records,
  onOpenAddRecord,
  onEditRecord,
  onDeleteRecord,
  onQuickUpdateKm,
  onMarkRecordCompleted,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | ServiceType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !vehicle) return null;

  const vehicleRecords = records.filter((r) => r.placa === vehicle.placa);

  // Filter by service type and search
  const filteredRecords = vehicleRecords.filter((record) => {
    const matchesTab = activeSubTab === 'ALL' || record.tipo === activeSubTab;
    const matchesSearch =
      record.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.problemaInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.facturaNumero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.repuestos.some((p) => p.nombre.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const totalSpent = vehicleRecords.reduce((sum, r) => sum + r.precioTotal, 0);
  const overdueCount = vehicleRecords.filter((r) => calculateRecordStatus(r, vehicle) === 'vencido').length;
  const upcomingCount = vehicleRecords.filter((r) => calculateRecordStatus(r, vehicle) === 'proximo').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden text-slate-100 my-4 flex flex-col max-h-[92vh]">
        {/* Subfolder Top Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            {/* Vehicle Main Info */}
            <div className="flex items-start gap-4">
              <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-700 font-mono text-xl font-black tracking-widest text-white shadow-xl ring-2 ring-red-600/30 flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                {vehicle.placa}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                    FICHA TÉCNICA Y SUBCARPRETA DE MANTENIMIENTO
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  {vehicle.marca} {vehicle.modelo} <span className="text-slate-400 font-normal">({vehicle.anio})</span>
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Responsable: {vehicle.asignadoA}
                  </span>
                  <span>• Combustible: {vehicle.tipoCombustible}</span>
                  {vehicle.color && <span>• Color: {vehicle.color}</span>}
                  {vehicle.vin && <span>• VIN: {vehicle.vin}</span>}
                </div>
              </div>
            </div>

            {/* Quick Stats & Close */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <div className="px-3 py-1 text-center border-r border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Kilometraje</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    {formatKm(vehicle.kilometrajeActual)}
                    <button
                      onClick={() => onQuickUpdateKm(vehicle)}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
                <div className="px-3 py-1 text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Total Invertido</div>
                  <div className="text-sm font-bold text-emerald-400">{formatCurrency(totalSpent)}</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Alert status indicator bar */}
          {(overdueCount > 0 || upcomingCount > 0) && (
            <div className="mt-4 flex items-center gap-3 bg-red-950/40 border border-red-800/80 px-4 py-2 rounded-xl text-xs text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Atención: Esta subcarpeta tiene <strong>{overdueCount} servicios vencidos</strong> y{' '}
                <strong>{upcomingCount} próximos a vencer</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Subfolder Category Tabs & Search Bar */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs by Service Category */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveSubTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'ALL'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({vehicleRecords.length})
            </button>
            <button
              onClick={() => setActiveSubTab('Reparación')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'Reparación'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🛠️ Reparaciones ({vehicleRecords.filter((r) => r.tipo === 'Reparación').length})
            </button>
            <button
              onClick={() => setActiveSubTab('Cambio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'Cambio'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🔄 Cambios ({vehicleRecords.filter((r) => r.tipo === 'Cambio').length})
            </button>
            <button
              onClick={() => setActiveSubTab('Mantenimiento')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'Mantenimiento'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🧰 Mantenimiento ({vehicleRecords.filter((r) => r.tipo === 'Mantenimiento').length})
            </button>
            <button
              onClick={() => setActiveSubTab('Servicio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'Servicio'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🚗 Servicios ({vehicleRecords.filter((r) => r.tipo === 'Servicio').length})
            </button>
          </div>

          {/* Search inside Subfolder */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en ficha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={() => onOpenAddRecord(vehicle.placa)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-md shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Registro</span>
            </button>
          </div>
        </div>

        {/* Records Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {filteredRecords.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400">
              <Wrench className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No hay registros en esta categoría</p>
              <p className="text-xs text-slate-500 mt-1">
                Haga clic en "+ Nuevo Registro" para añadir mantenimientos, repuestos y facturas para este vehículo.
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const status = calculateRecordStatus(record, vehicle);
              const badge = getStatusBadge(status);

              return (
                <div
                  key={record.id}
                  className={`bg-slate-950/80 rounded-2xl border p-5 transition-all shadow-lg hover:border-slate-700 ${
                    status === 'vencido'
                      ? 'border-red-900/80 ring-1 ring-red-500/20'
                      : status === 'proximo'
                      ? 'border-amber-900/80'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Record Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-800 text-red-400 border border-slate-700">
                          {record.tipo}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.bgDot}`} />
                          {badge.label}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{record.titulo}</h3>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <button
                        onClick={() => onMarkRecordCompleted(record)}
                        className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                        title="Registrar nuevo ciclo / Marcar como al día"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Completado / Renovar</span>
                      </button>
                      <button
                        onClick={() => onEditRecord(record)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Field Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
                    {/* Dates & Mileage */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 space-y-1.5">
                      <div className="text-slate-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        Fechas y Kilometraje
                      </div>
                      <div className="text-slate-200">
                        • Realizado: <strong className="text-white">{formatDateReadable(record.fecha)}</strong> (
                        {formatKm(record.kilometrajeRealizado)})
                      </div>
                      <div className="text-slate-200">
                        • Próximo Límite:{' '}
                        <strong className={status === 'vencido' ? 'text-red-400' : 'text-amber-300'}>
                          {record.proximaFecha ? formatDateReadable(record.proximaFecha) : 'Sin fecha'}
                        </strong>
                        {record.proximoKilometraje ? ` | ${formatKm(record.proximoKilometraje)}` : ''}
                      </div>
                    </div>

                    {/* Requester & Workshop */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 space-y-1.5">
                      <div className="text-slate-400 font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        Solicitante y Proveedor
                      </div>
                      <div className="text-slate-200">
                        • Solicitado por: <strong className="text-white">{record.solicitante}</strong>
                      </div>
                      <div className="text-slate-200">
                        • Taller/Mecánico:{' '}
                        <strong className="text-white">{record.tallerMecanico || 'No especificado'}</strong>
                      </div>
                    </div>

                    {/* Invoice & Total Price */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 space-y-1.5">
                      <div className="text-slate-400 font-semibold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        Facturación y Costo
                      </div>
                      <div className="text-slate-200">
                        • N° Factura: <strong className="text-white font-mono">{record.facturaNumero}</strong>
                      </div>
                      <div className="text-slate-200">
                        • Costo Total:{' '}
                        <strong className="text-base font-bold text-emerald-400">
                          {formatCurrency(record.precioTotal)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  {record.problemaInfo && (
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 mb-3 text-xs">
                      <span className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        Información del Problema / Diagnóstico:
                      </span>
                      <p className="text-slate-300 italic">{record.problemaInfo}</p>
                    </div>
                  )}

                  {/* Repuestos Table */}
                  {record.repuestos && record.repuestos.length > 0 && (
                    <div className="mt-3 border-t border-slate-800/80 pt-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-red-400" />
                        Repuestos e Insumos Utilizados ({record.repuestos.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {record.repuestos.map((part) => (
                          <div
                            key={part.id}
                            className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between"
                          >
                            <span className="text-slate-200 font-medium truncate">{part.nombre}</span>
                            <span className="text-slate-400 text-[11px] ml-2 shrink-0">
                              {part.cantidad} x ${part.precioUnitario} ={' '}
                              <strong className="text-red-400">${part.cantidad * part.precioUnitario}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
