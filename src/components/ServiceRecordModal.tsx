import React, { useState } from 'react';
import { ServiceRecord, ServiceType, SparePart, Vehicle } from '../types';
import { X, Plus, Trash2, Wrench, AlertCircle, FileText, User, DollarSign, Tag, Calendar, Gauge } from 'lucide-react';

interface ServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<ServiceRecord, 'id' | 'creadoEn'>) => void;
  vehicles: Vehicle[];
  initialPlaca?: string;
  existingRecord?: ServiceRecord;
}

export const ServiceRecordModal: React.FC<ServiceRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vehicles,
  initialPlaca,
  existingRecord,
}) => {
  const [placa, setPlaca] = useState<string>(existingRecord?.placa || initialPlaca || vehicles[0]?.placa || '');
  const [tipo, setTipo] = useState<ServiceType>(existingRecord?.tipo || 'Mantenimiento');
  const [titulo, setTitulo] = useState<string>(existingRecord?.titulo || '');
  const [fecha, setFecha] = useState<string>(existingRecord?.fecha || new Date().toISOString().split('T')[0]);

  // Selected vehicle current mileage for auto-filling
  const selectedVehicle = vehicles.find((v) => v.placa === placa);

  const [kilometrajeRealizado, setKilometrajeRealizado] = useState<number>(
    existingRecord?.kilometrajeRealizado || selectedVehicle?.kilometrajeActual || 0
  );
  const [proximaFecha, setProximaFecha] = useState<string>(existingRecord?.proximaFecha || '');
  const [proximoKilometraje, setProximoKilometraje] = useState<number | undefined>(
    existingRecord?.proximoKilometraje || (selectedVehicle ? selectedVehicle.kilometrajeActual + 10000 : undefined)
  );

  const [problemaInfo, setProblemaInfo] = useState<string>(existingRecord?.problemaInfo || '');
  const [solicitante, setSolicitante] = useState<string>(existingRecord?.solicitante || '');
  const [tallerMecanico, setTallerMecanico] = useState<string>(existingRecord?.tallerMecanico || '');

  // Spare parts list
  const [repuestos, setRepuestos] = useState<SparePart[]>(existingRecord?.repuestos || []);
  const [newPartNombre, setNewPartNombre] = useState<string>('');
  const [newPartCantidad, setNewPartCantidad] = useState<number>(1);
  const [newPartPrecio, setNewPartPrecio] = useState<number>(0);

  const [precioTotalCustom, setPrecioTotalCustom] = useState<number | undefined>(existingRecord?.precioTotal);
  const [facturaNumero, setFacturaNumero] = useState<string>(existingRecord?.facturaNumero || '');
  const [facturaDetalle, setFacturaDetalle] = useState<string>(existingRecord?.facturaDetalle || '');
  const [notas, setNotas] = useState<string>(existingRecord?.notas || '');

  // Auto calculate spare parts sum
  const calculatedPartsTotal = repuestos.reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0);
  const effectiveTotal = precioTotalCustom !== undefined ? precioTotalCustom : calculatedPartsTotal;

  // When vehicle changes, sync mileage if not editing
  const handlePlacaChange = (newPlaca: string) => {
    setPlaca(newPlaca);
    if (!existingRecord) {
      const v = vehicles.find((veh) => veh.placa === newPlaca);
      if (v) {
        setKilometrajeRealizado(v.kilometrajeActual);
        setProximoKilometraje(v.kilometrajeActual + 10000);
      }
    }
  };

  const handleAddPart = () => {
    if (!newPartNombre.trim()) return;
    const newPart: SparePart = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      nombre: newPartNombre.trim(),
      cantidad: newPartCantidad > 0 ? newPartCantidad : 1,
      precioUnitario: newPartPrecio >= 0 ? newPartPrecio : 0,
    };
    const updated = [...repuestos, newPart];
    setRepuestos(updated);

    // Update total automatically
    const newSum = updated.reduce((s, p) => s + p.cantidad * p.precioUnitario, 0);
    setPrecioTotalCustom(newSum);

    // Reset part inputs
    setNewPartNombre('');
    setNewPartCantidad(1);
    setNewPartPrecio(0);
  };

  const handleRemovePart = (id: string) => {
    const updated = repuestos.filter((p) => p.id !== id);
    setRepuestos(updated);
    const newSum = updated.reduce((s, p) => s + p.cantidad * p.precioUnitario, 0);
    setPrecioTotalCustom(newSum);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !titulo.trim() || !solicitante.trim()) {
      alert('Por favor complete los campos obligatorios (Vehículo, Título del trabajo, Persona Solicitante).');
      return;
    }

    onSave({
      placa,
      tipo,
      titulo: titulo.trim(),
      fecha,
      kilometrajeRealizado: Number(kilometrajeRealizado) || 0,
      proximaFecha: proximaFecha || undefined,
      proximoKilometraje: proximoKilometraje ? Number(proximoKilometraje) : undefined,
      problemaInfo: problemaInfo.trim(),
      solicitante: solicitante.trim(),
      tallerMecanico: tallerMecanico.trim(),
      repuestos,
      precioTotal: Number(effectiveTotal) || 0,
      facturaNumero: facturaNumero.trim() || 'S/F',
      facturaDetalle: facturaDetalle.trim(),
      notas: notas.trim(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {existingRecord ? 'Editar Registro de Mantenimiento' : 'Nuevo Registro de Mantenimiento'}
              </h2>
              <p className="text-xs text-slate-400">
                Ficha técnica para control de servicio, repuestos y factura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin">
          {/* Section 1: Classification & Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-red-400" />
                Vehículo por Placa *
              </label>
              <select
                value={placa}
                onChange={(e) => handlePlacaChange(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              >
                {vehicles.length === 0 ? (
                  <option value="">No hay vehículos registrados</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.placa} value={v.placa}>
                      {v.placa} - {v.marca} {v.modelo} ({v.kilometrajeActual.toLocaleString()} km)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Servicio *</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as ServiceType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              >
                <option value="Mantenimiento">Mantenimiento Preventivo</option>
                <option value="Reparación">Reparación Correctiva</option>
                <option value="Cambio">Cambio de Pieza/Consumible</option>
                <option value="Servicio">Servicio / Inspección</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Trabajo / Servicio *</label>
              <input
                type="text"
                placeholder="Ej. Cambio de Aceite Sintético 5W-30 y Filtros"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Section 2: Dates and Mileage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Fecha Realizado *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                Kilometraje al Realizar (km) *
              </label>
              <input
                type="number"
                value={kilometrajeRealizado}
                onChange={(e) => setKilometrajeRealizado(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Próxima Fecha Programada
              </label>
              <input
                type="date"
                value={proximaFecha}
                onChange={(e) => setProximaFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Alerta por fecha cuando se aproxime</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Próximo Kilometraje Programado (km)
              </label>
              <input
                type="number"
                placeholder="Ej. 95000"
                value={proximoKilometraje || ''}
                onChange={(e) => setProximoKilometraje(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Alerta por kilometraje de vehículo</span>
            </div>
          </div>

          {/* Section 3: Diagnostic / Persona solicitante / Taller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                Persona Solicitante / Encargado *
              </label>
              <input
                type="text"
                placeholder="Ej. Ing. Roberto Gómez / Juan Pérez"
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Taller Mecánico / Proveedor</label>
              <input
                type="text"
                placeholder="Ej. Servispeed Automotriz / Taller Central"
                value={tallerMecanico}
                onChange={(e) => setTallerMecanico(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                Información del Problema / Diagnóstico
              </label>
              <textarea
                rows={2}
                placeholder="Describa la falla presentada, motivo del servicio o estado previo..."
                value={problemaInfo}
                onChange={(e) => setProblemaInfo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Section 4: Repuestos Utilizados */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-red-400" />
              Detalle de Repuestos Utilizados
            </h3>

            {/* List of current spare parts */}
            {repuestos.length > 0 && (
              <div className="mb-4 space-y-2 max-h-40 overflow-y-auto pr-1">
                {repuestos.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{part.nombre}</span>
                      <span className="text-slate-400">
                        ({part.cantidad} {part.cantidad > 1 ? 'uds' : 'ud'} x ${part.precioUnitario})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-400">
                        ${(part.cantidad * part.precioUnitario).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(part.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Part Form Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[11px] text-slate-400 mb-1">Nombre del Repuesto / Pieza</label>
                <input
                  type="text"
                  placeholder="Ej. Filtro de Aceite OEM / Pastillas Ceramicas"
                  value={newPartNombre}
                  onChange={(e) => setNewPartNombre(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Cant.</label>
                <input
                  type="number"
                  min="1"
                  value={newPartCantidad}
                  onChange={(e) => setNewPartCantidad(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-slate-400 mb-1">Precio C/U ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={newPartPrecio || ''}
                  onChange={(e) => setNewPartPrecio(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center"
                  title="Agregar repuesto"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Invoice & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-400" />
                Número de Factura / Comprobante
              </label>
              <input
                type="text"
                placeholder="Ej. F-98212 / S/F"
                value={facturaNumero}
                onChange={(e) => setFacturaNumero(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Precio Total del Servicio ($)
              </label>
              <input
                type="number"
                placeholder="Auto-calculado o personalizado"
                value={precioTotalCustom !== undefined ? precioTotalCustom : ''}
                onChange={(e) => setPrecioTotalCustom(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Detalle de Factura / Notas Adicionales</label>
              <input
                type="text"
                placeholder="Ej. Factura enviada a contabilidad, garantía de 6 meses..."
                value={facturaDetalle}
                onChange={(e) => setFacturaDetalle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
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
              <Wrench className="w-4 h-4" />
              <span>{existingRecord ? 'Guardar Cambios' : 'Registrar Mantenimiento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
