import React, { useState } from 'react';
import { ServiceRecord, Vehicle } from '../types';
import { formatCurrency, formatDateReadable } from '../utils/helpers';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { FileText, Printer, Download, Filter, DollarSign, Wrench, Car, Tag, Calendar } from 'lucide-react';

interface ReportsViewProps {
  records: ServiceRecord[];
  vehicles: Vehicle[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ records, vehicles }) => {
  const [selectedPlaca, setSelectedPlaca] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_3_MONTHS' | 'THIS_YEAR'>('ALL');

  // Date filtering logic
  const filteredRecords = records.filter((record) => {
    // Vehicle filter
    if (selectedPlaca !== 'ALL' && record.placa !== selectedPlaca) return false;

    // Date range filter
    if (dateRange === 'ALL') return true;

    const recordDate = new Date(record.fecha);
    const now = new Date();

    if (dateRange === 'THIS_MONTH') {
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    }

    if (dateRange === 'LAST_3_MONTHS') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return recordDate >= threeMonthsAgo;
    }

    if (dateRange === 'THIS_YEAR') {
      return recordDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  // Calculate Metrics
  const totalCost = filteredRecords.reduce((sum, r) => sum + r.precioTotal, 0);
  const totalParts = filteredRecords.reduce((sum, r) => sum + r.repuestos.reduce((s, p) => s + p.cantidad, 0), 0);
  const averageCostPerRecord = filteredRecords.length > 0 ? totalCost / filteredRecords.length : 0;

  // Pie Chart Data: Expense by Service Type
  const categoryTotals: Record<string, number> = {
    Mantenimiento: 0,
    Reparación: 0,
    Cambio: 0,
    Servicio: 0,
  };

  filteredRecords.forEach((r) => {
    if (categoryTotals[r.tipo] !== undefined) {
      categoryTotals[r.tipo] += r.precioTotal;
    } else {
      categoryTotals[r.tipo] = r.precioTotal;
    }
  });

  const pieChartData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  }));

  const COLORS = ['#DC2626', '#3B82F6', '#F59E0B', '#10B981'];

  // Bar Chart Data: Expense by Vehicle
  const vehicleTotalsMap: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    vehicleTotalsMap[r.placa] = (vehicleTotalsMap[r.placa] || 0) + r.precioTotal;
  });

  const barChartData = Object.keys(vehicleTotalsMap).map((placa) => ({
    placa,
    monto: vehicleTotalsMap[placa],
  }));

  // Download CSV feature
  const handleExportCSV = () => {
    let csv = 'Placa,Fecha,Tipo,Titulo,Solicitante,Taller,Factura,CostoTotal,Repuestos\n';
    filteredRecords.forEach((r) => {
      const partsStr = r.repuestos.map((p) => `${p.cantidad}x ${p.nombre}`).join('; ');
      csv += `"${r.placa}","${r.fecha}","${r.tipo}","${r.titulo.replace(/"/g, '""')}","${r.solicitante.replace(
        /"/g,
        '""'
      )}","${(r.tallerMecanico || '').replace(/"/g, '""')}","${r.facturaNumero}",${r.precioTotal},"${partsStr}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `informe_mantenimiento_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report feature
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">INFORMES Y ANÁLISIS DE COSTOS</h2>
            <p className="text-xs text-slate-400">Reporte detallado por vehículo, rango de fechas y costos de repuestos</p>
          </div>
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Vehicle Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <Car className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedPlaca}
              onChange={(e) => setSelectedPlaca(e.target.value)}
              className="bg-transparent text-white px-2 py-0.5 focus:outline-none"
            >
              <option value="ALL">Todos los Vehículos</option>
              {vehicles.map((v) => (
                <option key={v.placa} value={v.placa}>
                  {v.placa} - {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent text-white px-2 py-0.5 focus:outline-none"
            >
              <option value="ALL">Todo el Historial</option>
              <option value="THIS_MONTH">Este Mes</option>
              <option value="LAST_3_MONTHS">Últimos 3 Meses</option>
              <option value="THIS_YEAR">Año Actual</option>
            </select>
          </div>

          {/* CSV & Print Buttons */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Costo Total de Mantenimiento
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatCurrency(totalCost)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{filteredRecords.length} servicios registrados</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
            <Wrench className="w-4 h-4 text-red-400" />
            Total de Servicios Realizados
          </div>
          <div className="text-2xl font-black text-white">{filteredRecords.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">En el período seleccionado</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
            <Tag className="w-4 h-4 text-amber-400" />
            Repuestos / Piezas Utilizadas
          </div>
          <div className="text-2xl font-black text-amber-400">{totalParts} uds</div>
          <div className="text-[11px] text-slate-500 mt-1">Sustituidas en reparaciones</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-blue-400" />
            Costo Promedio por Servicio
          </div>
          <div className="text-2xl font-black text-blue-400">{formatCurrency(averageCostPerRecord)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Gasto medio por orden</div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Expenses by Category */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Distribución de Gastos por Categoría
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Monto']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Expenses by Vehicle Plate */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Comparativa de Inversión por Vehículo (Placa)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="placa" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Gasto Total']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="monto" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Detalle de Registros de Mantenimiento ({filteredRecords.length})</h3>
          <span className="text-xs text-slate-400">Ordenado por fecha</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Placa</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Título / Trabajo</th>
                <th className="py-3 px-4">Solicitante</th>
                <th className="py-3 px-4">Repuestos</th>
                <th className="py-3 px-4">N° Factura</th>
                <th className="py-3 px-4 text-right">Costo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No hay registros de mantenimiento para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{r.placa}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDateReadable(r.fecha)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-red-400 border border-slate-700">
                        {r.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{r.titulo}</td>
                    <td className="py-3 px-4 text-slate-300">{r.solicitante}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {r.repuestos.length > 0
                        ? r.repuestos.map((p) => `${p.cantidad}x ${p.nombre}`).join(', ')
                        : 'Sin repuestos'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{r.facturaNumero}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatCurrency(r.precioTotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
