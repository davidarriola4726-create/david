import { ServiceRecord, Vehicle } from '../types';
import { getInitialSeedData } from './helpers';

const STORAGE_KEY_VEHICLES = 'control_vehiculos_fleet_v2';
const STORAGE_KEY_RECORDS = 'control_vehiculos_records_v2';

export function loadVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading vehicles from localStorage:', e);
  }

  // Fallback to seed data
  const seed = getInitialSeedData();
  saveVehicles(seed.vehicles);
  saveRecords(seed.records);
  return seed.vehicles;
}

export function saveVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
  } catch (e) {
    console.error('Error saving vehicles:', e);
  }
}

export function loadRecords(): ServiceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading records from localStorage:', e);
  }

  const seed = getInitialSeedData();
  saveRecords(seed.records);
  return seed.records;
}

export function saveRecords(records: ServiceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving records:', e);
  }
}

export function resetToSeedData(): { vehicles: Vehicle[]; records: ServiceRecord[] } {
  const seed = getInitialSeedData();
  saveVehicles(seed.vehicles);
  saveRecords(seed.records);
  return seed;
}
