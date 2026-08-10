import React, { useState } from 'react';
import { AlertStatus, ServiceRecord, Vehicle } from '../types';
import { calculateRecordStatus, formatDateReadable, formatKm, getStatusBadge } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Filter, Wrench, User, Gauge } from 'lucide-react';

interface CalendarViewProps {
  records: ServiceRecord[];
  vehicles: Vehicle[];
  onOpenAddRecordWithDate?: (dateStr: string) => void;
  onSelectRecord?: (record: ServiceRecord) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  vehicles,
  onOpenAddRecordWithDate,
  onSelectRecord,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlacaFilter, setSelectedPlacaFilter] = useState<string>('ALL');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const todayMonth = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const calendarDays = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      dayNumber: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: new Date(year, month - 1, prevMonthDays - i).toISOString().split('T')[0],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateStr: dStr,
    });
  }

  // Next month padding to fill 35 or 42 grid cells
  const remainingCells = 35 - calendarDays.length;
  if (remainingCells > 0) {
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateStr: new Date(year, month + 1, i).toISOString().split('T')[0],
      });
    }
  }

  // Get records scheduled (proximaFecha) or performed (fecha) for each day
  const getEventsForDate = (dateStr: string) => {
    return records.filter((r) => {
      if (selectedPlacaFilter !== 'ALL' && r.placa !== selectedPlacaFilter) return false;
      return r.proximaFecha === dateStr || r.fecha === dateStr;
    });
  };

  const isToday = (dateStr: string) => {
    const now = new Date().toISOString().split('T')[0];
    return dateStr === now;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Calendar Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Month & Navigation */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">Servicios programados y mantenimientos vencidos por fecha</p>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={selectedPlacaFilter}
              onChange={(e) => setSelectedPlacaFilter(e.target.value)}
              className="bg-transparent text-xs text-white px-2 py-1 focus:outline-none"
            >
              <option value="ALL">Todas las Placas</option>
              {vehicles.map((v) => (
                <option key={v.placa} value={v.placa}>
                  {v.placa} ({v.marca})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={todayMonth}
              className="px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              Hoy
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
        <span className="font-bold text-slate-400 uppercase text-[10px]">Alertas:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Servicio al día / Realizado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Próximo a vencer (&le;15 días)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> Servicio Vencido
        </span>
      </div>

      {/* Monthly Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-slate-950 text-center text-xs font-bold text-slate-400 border-b border-slate-800 py-3">
          <div>Dom</div>
          <div>Lun</div>
          <div>Mar</div>
          <div>Mié</div>
          <div>Jue</div>
          <div>Vie</div>
          <div>Sáb</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/60 bg-slate-900">
          {calendarDays.map((cell, idx) => {
            const dayEvents = getEventsForDate(cell.dateStr);
            const todayCell = isToday(cell.dateStr);

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 transition-all flex flex-col justify-between group ${
                  cell.isCurrentMonth ? 'bg-slate-900/60' : 'bg-slate-950/40 opacity-40'
                } ${todayCell ? 'ring-2 ring-red-500/80 bg-red-950/10' : ''}`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      todayCell ? 'bg-red-600 text-white' : 'text-slate-300'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.isCurrentMonth && onOpenAddRecordWithDate && (
                    <button
                      onClick={() => onOpenAddRecordWithDate(cell.dateStr)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                      title="Agendar servicio en esta fecha"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Day Events List */}
                <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-none flex-1">
                  {dayEvents.map((record) => {
                    const vehicle = vehicles.find((v) => v.placa === record.placa);
                    const status = calculateRecordStatus(record, vehicle);
                    const isNextDue = record.proximaFecha === cell.dateStr;

                    return (
                      <div
                        key={record.id}
                        onClick={() => onSelectRecord && onSelectRecord(record)}
                        className={`p-1.5 rounded-lg border text-[11px] cursor-pointer transition shadow-sm truncate ${
                          status === 'vencido'
                            ? 'bg-red-950/80 text-red-300 border-red-800 hover:bg-red-900'
                            : status === 'proximo'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                        }`}
                        title={`${record.placa}: ${record.titulo} (${isNextDue ? 'PROGRAMADO' : 'REALIZADO'})`}
                      >
                        <div className="font-bold flex items-center gap-1 truncate">
                          <span className="font-mono text-[10px] uppercase">{record.placa}</span>
                          <span>• {record.titulo}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
