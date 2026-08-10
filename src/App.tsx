import React, { useState, useEffect } from 'react';
import { ActiveTab, AlertSummary, ServiceRecord, Vehicle } from './types';
import { loadVehicles, saveVehicles, loadRecords, saveRecords, resetToSeedData } from './utils/storage';
import { calculateRecordStatus } from './utils/helpers';
import { HeaderMenu } from './components/HeaderMenu';
import { VehicleList } from './components/VehicleList';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { ServiceRecordModal } from './components/ServiceRecordModal';
import { VehicleModal } from './components/VehicleModal';
import { QuickOdometerModal } from './components/QuickOdometerModal';
import { CalendarView } from './components/CalendarView';
import { ReportsView } from './components/ReportsView';
import { AlertsCenter } from './components/AlertsCenter';
import { DataSettings } from './components/DataSettings';

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('vehiculos');

  // Modal States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | undefined>(undefined);
  const [recordInitialPlaca, setRecordInitialPlaca] = useState<string | undefined>(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);

  const [isQuickKmModalOpen, setIsQuickKmModalOpen] = useState(false);
  const [vehicleForQuickKm, setVehicleForQuickKm] = useState<Vehicle | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const loadedVehicles = loadVehicles();
    const loadedRecords = loadRecords();
    setVehicles(loadedVehicles);
    setRecords(loadedRecords);
  }, []);

  // Sync state to LocalStorage
  const updateVehiclesState = (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
    saveVehicles(newVehicles);
  };

  const updateRecordsState = (newRecords: ServiceRecord[]) => {
    setRecords(newRecords);
    saveRecords(newRecords);
  };

  // Calculate Summary
  const summary: AlertSummary = {
    alDia: records.filter((r) => calculateRecordStatus(r, vehicles.find((v) => v.placa === r.placa)) === 'al_dia').length,
    proximos: records.filter((r) => calculateRecordStatus(r, vehicles.find((v) => v.placa === r.placa)) === 'proximo').length,
    vencidos: records.filter((r) => calculateRecordStatus(r, vehicles.find((v) => v.placa === r.placa)) === 'vencido').length,
    totalVehiculos: vehicles.length,
    totalServicios: records.length,
  };

  // Handlers for Vehicles
  const handleSaveVehicle = (vehicleData: Vehicle) => {
    const existingIndex = vehicles.findIndex((v) => v.placa === vehicleData.placa);
    let updated: Vehicle[];

    if (existingIndex >= 0) {
      updated = [...vehicles];
      updated[existingIndex] = vehicleData;
    } else {
      updated = [vehicleData, ...vehicles];
    }

    updateVehiclesState(updated);

    if (selectedVehicleForDetail?.placa === vehicleData.placa) {
      setSelectedVehicleForDetail(vehicleData);
    }
  };

  const handleDeleteVehicle = (placa: string) => {
    if (confirm(`¿Está seguro de eliminar el vehículo con placa ${placa}? Se eliminará su historial y ficha.`)) {
      const updatedVehicles = vehicles.filter((v) => v.placa !== placa);
      const updatedRecords = records.filter((r) => r.placa !== placa);
      updateVehiclesState(updatedVehicles);
      updateRecordsState(updatedRecords);

      if (selectedVehicleForDetail?.placa === placa) {
        setIsDetailModalOpen(false);
        setSelectedVehicleForDetail(null);
      }
    }
  };

  // Handlers for Service Records
  const handleSaveRecord = (recordData: Omit<ServiceRecord, 'id' | 'creadoEn'>) => {
    if (editingRecord) {
      const updatedRecords = records.map((r) =>
        r.id === editingRecord.id
          ? {
              ...recordData,
              id: editingRecord.id,
              creadoEn: editingRecord.creadoEn,
            }
          : r
      );
      updateRecordsState(updatedRecords);
    } else {
      const newRecord: ServiceRecord = {
        ...recordData,
        id: `REC_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        creadoEn: new Date().toISOString().split('T')[0],
      };
      updateRecordsState([newRecord, ...records]);
    }

    // Check if performed mileage is higher than vehicle's current mileage, and offer to sync
    const targetVehicle = vehicles.find((v) => v.placa === recordData.placa);
    if (targetVehicle && recordData.kilometrajeRealizado > targetVehicle.kilometrajeActual) {
      const updatedVehicles = vehicles.map((v) =>
        v.placa === targetVehicle.placa
          ? { ...v, kilometrajeActual: recordData.kilometrajeRealizado }
          : v
      );
      updateVehiclesState(updatedVehicles);
      if (selectedVehicleForDetail?.placa === targetVehicle.placa) {
        setSelectedVehicleForDetail({ ...targetVehicle, kilometrajeActual: recordData.kilometrajeRealizado });
      }
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('¿Desea eliminar este registro de mantenimiento?')) {
      const updated = records.filter((r) => r.id !== id);
      updateRecordsState(updated);
    }
  };

  const handleMarkRecordCompleted = (record: ServiceRecord) => {
    const targetVehicle = vehicles.find((v) => v.placa === record.placa);
    const todayStr = new Date().toISOString().split('T')[0];
    const currentKm = targetVehicle ? targetVehicle.kilometrajeActual : record.kilometrajeRealizado;

    // Calculate new next date (+6 months) and next km (+10,000 km)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 6);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    const updatedRecords = records.map((r) =>
      r.id === record.id
        ? {
            ...r,
            fecha: todayStr,
            kilometrajeRealizado: currentKm,
            proximaFecha: nextDateStr,
            proximoKilometraje: currentKm + 10000,
          }
        : r
    );

    updateRecordsState(updatedRecords);
    alert(`El mantenimiento ${record.titulo} (${record.placa}) se ha marcado como completado y reprogramado para ${nextDateStr}.`);
  };

  // Quick Mileage Update
  const handleQuickUpdateMileage = (placa: string, newKm: number) => {
    const updatedVehicles = vehicles.map((v) => (v.placa === placa ? { ...v, kilometrajeActual: newKm } : v));
    updateVehiclesState(updatedVehicles);

    if (selectedVehicleForDetail?.placa === placa) {
      setSelectedVehicleForDetail({ ...selectedVehicleForDetail, kilometrajeActual: newKm });
    }
  };

  // Reset or Import Data
  const handleResetData = () => {
    const seed = resetToSeedData();
    setVehicles(seed.vehicles);
    setRecords(seed.records);
  };

  const handleImportData = (importedVehicles: Vehicle[], importedRecords: ServiceRecord[]) => {
    updateVehiclesState(importedVehicles);
    updateRecordsState(importedRecords);
  };

  // Modal Open Trigger Helpers
  const handleOpenAddVehicle = () => {
    setEditingVehicle(undefined);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleOpenAddRecord = (initialPlaca?: string) => {
    setEditingRecord(undefined);
    setRecordInitialPlaca(initialPlaca);
    setIsRecordModalOpen(true);
  };

  const handleOpenEditRecord = (record: ServiceRecord) => {
    setEditingRecord(record);
    setRecordInitialPlaca(record.placa);
    setIsRecordModalOpen(true);
  };

  const handleOpenVehicleDetailModal = (vehicle: Vehicle) => {
    setSelectedVehicleForDetail(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleOpenQuickKmModal = (vehicle: Vehicle) => {
    setVehicleForQuickKm(vehicle);
    setIsQuickKmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Interactive Menu Header featuring attached image aesthetic */}
      <HeaderMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summary}
        onOpenNewVehicle={handleOpenAddVehicle}
        onOpenNewRecord={() => handleOpenAddRecord()}
      />

      {/* Main App Content View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'vehiculos' && (
          <VehicleList
            vehicles={vehicles}
            records={records}
            onSelectVehicleFicha={handleOpenVehicleDetailModal}
            onOpenNewVehicle={handleOpenAddVehicle}
            onEditVehicle={handleOpenEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onQuickUpdateKm={handleOpenQuickKmModal}
            onAddServiceRecordForVehicle={(placa) => handleOpenAddRecord(placa)}
          />
        )}

        {activeTab === 'fichas' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">SUBCARPETAS Y FICHAS POR VEHÍCULO</h2>
                <p className="text-xs text-slate-400">
                  Seleccione un vehículo por su placa para acceder a su subcarpeta técnica individual
                </p>
              </div>
            </div>

            <VehicleList
              vehicles={vehicles}
              records={records}
              onSelectVehicleFicha={handleOpenVehicleDetailModal}
              onOpenNewVehicle={handleOpenAddVehicle}
              onEditVehicle={handleOpenEditVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onQuickUpdateKm={handleOpenQuickKmModal}
              onAddServiceRecordForVehicle={(placa) => handleOpenAddRecord(placa)}
            />
          </div>
        )}

        {activeTab === 'calendario' && (
          <CalendarView
            records={records}
            vehicles={vehicles}
            onOpenAddRecordWithDate={(dateStr) => {
              handleOpenAddRecord();
            }}
            onSelectRecord={(record) => {
              handleOpenEditRecord(record);
            }}
          />
        )}

        {activeTab === 'informes' && <ReportsView records={records} vehicles={vehicles} />}

        {activeTab === 'alertas' && (
          <AlertsCenter
            records={records}
            vehicles={vehicles}
            onSelectVehicleFicha={handleOpenVehicleDetailModal}
            onMarkRecordCompleted={handleMarkRecordCompleted}
            onQuickUpdateKm={handleOpenQuickKmModal}
          />
        )}

        {activeTab === 'datos' && (
          <DataSettings
            vehicles={vehicles}
            records={records}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Control de Mantenimiento de Vehículos &copy; 2026
          </div>
          <p className="text-slate-500">
            Sistema con alertas automáticas por fecha/kilometraje, subcarpetas por placa e informes exportables.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
        existingVehicle={editingVehicle}
      />

      <ServiceRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSaveRecord}
        vehicles={vehicles}
        initialPlaca={recordInitialPlaca}
        existingRecord={editingRecord}
      />

      <VehicleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        vehicle={selectedVehicleForDetail}
        records={records}
        onOpenAddRecord={(placa) => handleOpenAddRecord(placa)}
        onEditRecord={(record) => handleOpenEditRecord(record)}
        onDeleteRecord={handleDeleteRecord}
        onQuickUpdateKm={handleOpenQuickKmModal}
        onMarkRecordCompleted={handleMarkRecordCompleted}
      />

      <QuickOdometerModal
        isOpen={isQuickKmModalOpen}
        onClose={() => setIsQuickKmModalOpen(false)}
        vehicle={vehicleForQuickKm}
        onUpdateMileage={handleQuickUpdateMileage}
      />
    </div>
  );
}
