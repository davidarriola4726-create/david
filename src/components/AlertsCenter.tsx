import React from 'react';
import { ServiceRecord, Vehicle } from '../types';
import { calculateRecordStatus, formatDateReadable, formatKm, getStatusBadge } from '../utils/helpers';
import { AlertTriangle, ShieldAlert, CheckCircle, Calendar, Gauge, Wrench, User, FileText } from 'lucide-react';

interface AlertsCenterProps {
  records: ServiceRecord[];
  vehicles: Vehicle[];
  onSelectVehicleFicha: (vehicle: Vehicle) => void;
  onMarkRecordCompleted: (record: ServiceRecord) => void;
  onQuickUpdateKm: (vehicle: Vehicle) => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({
  records,
  vehicles,
  onSelectVehicleFicha,
  onMarkRecordCompleted,
  onQuickUpdateKm,
}) => {
  // Collect all records with their status
  const analyzedRecords = records.map((record) => {
    const vehicle = vehicles.find((v) => v.placa === record.placa);
    const status = calculateRecordStatus(record, vehicle);
    return { record, vehicle, status };
  });

  const overdueItems = analyzedRecords.filter((item) => item.status === 'vencido');
  const upcomingItems = analyzedRecords.filter((item) => item.status === 'proximo');
  const upToDateItems = analyzedRecords.filter((item) => item.status === 'al_dia');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">CENTRO DE ALERTAS Y SEMÁFORO DE MANTENIMIENTO</h2>
            <p className="text-xs text-slate-400">
              Evaluación automática por vencimiento de fecha o kilometraje del odiómetro
            </p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-red-400">Vencidos</div>
            <div className="text-xl font-black text-red-400">{overdueItems.length}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-amber-950/80 border border-amber-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-400">Próximos</div>
            <div className="text-xl font-black text-amber-400">{upcomingItems.length}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Al Día</div>
            <div className="text-xl font-black text-emerald-400">{upToDateItems.length}</div>
          </div>
        </div>
      </div>

      {/* OVERDUE SECTION (RED) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-red-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Servicios Vencidos Requieren Atención Inmediata ({overdueItems.length})</span>
        </div>

        {overdueItems.length === 0 ? (
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
            🎉 ¡Excelente! No hay servicios ni mantenimientos vencidos en la flota.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueItems.map(({ record, vehicle }) => {
              const badge = getStatusBadge('vencido');
              return (
                <div
                  key={record.id}
                  className="bg-red-950/20 border border-red-900/80 rounded-2xl p-4 space-y-3 shadow-lg ring-1 ring-red-500/20 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-950 text-white border border-slate-800">
                          {record.placa}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white">{record.titulo}</h4>
                      {vehicle && (
                        <p className="text-xs text-slate-400">
                          {vehicle.marca} {vehicle.modelo} | {vehicle.asignadoA}
                        </p>
                      )}
                    </div>

                    {vehicle && (
                      <button
                        onClick={() => onSelectVehicleFicha(vehicle)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      >
                        Ficha &rarr;
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="text-slate-300">
                      • Próxima Fecha Límite:{' '}
                      <strong className="text-red-400">
                        {record.proximaFecha ? formatDateReadable(record.proximaFecha) : 'Superada'}
                      </strong>
                    </div>
                    {record.proximoKilometraje && vehicle && (
                      <div className="text-slate-300">
                        • Kilometraje Límite:{' '}
                        <strong className="text-red-400">{formatKm(record.proximoKilometraje)}</strong> (Lectura actual:{' '}
                        {formatKm(vehicle.kilometrajeActual)})
                      </div>
                    )}
                    <div className="text-slate-400">• Solicitado por: {record.solicitante}</div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    {vehicle && (
                      <button
                        onClick={() => onQuickUpdateKm(vehicle)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      >
                        Actualizar Km
                      </button>
                    )}
                    <button
                      onClick={() => onMarkRecordCompleted(record)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-md shadow-red-950/50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Registrar Realizado</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UPCOMING SECTION (YELLOW) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Servicios Próximos a Vencer ({upcomingItems.length})</span>
        </div>

        {upcomingItems.length === 0 ? (
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
            No hay servicios próximos en el rango cercano de fecha u odiómetro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingItems.map(({ record, vehicle }) => {
              const badge = getStatusBadge('proximo');
              return (
                <div
                  key={record.id}
                  className="bg-amber-950/20 border border-amber-900/80 rounded-2xl p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-950 text-white border border-slate-800">
                          {record.placa}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.colorClass}`}>
                          {badge.label}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white">{record.titulo}</h4>
                      {vehicle && (
                        <p className="text-xs text-slate-400">
                          {vehicle.marca} {vehicle.modelo} | {vehicle.asignadoA}
                        </p>
                      )}
                    </div>

                    {vehicle && (
                      <button
                        onClick={() => onSelectVehicleFicha(vehicle)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      >
                        Ficha &rarr;
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="text-slate-300">
                      • Programado para:{' '}
                      <strong className="text-amber-300">
                        {record.proximaFecha ? formatDateReadable(record.proximaFecha) : 'Próximo por km'}
                      </strong>
                    </div>
                    {record.proximoKilometraje && vehicle && (
                      <div className="text-slate-300">
                        • Faltan:{' '}
                        <strong className="text-amber-300">
                          {formatKm(record.proximoKilometraje - vehicle.kilometrajeActual)}
                        </strong>{' '}
                        (Límite: {formatKm(record.proximoKilometraje)})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => onMarkRecordCompleted(record)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Registrar Realizado</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
