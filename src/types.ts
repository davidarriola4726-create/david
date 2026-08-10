export type ServiceType = 'Reparación' | 'Cambio' | 'Mantenimiento' | 'Servicio';

export type AlertStatus = 'al_dia' | 'proximo' | 'vencido';

export interface SparePart {
  id: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface ServiceRecord {
  id: string;
  placa: string; // Associated vehicle plate
  tipo: ServiceType;
  titulo: string;
  fecha: string; // YYYY-MM-DD
  kilometrajeRealizado: number;
  proximaFecha?: string; // YYYY-MM-DD
  proximoKilometraje?: number;
  problemaInfo: string; // Información del problema / diagnóstico
  solicitante: string; // Persona solicitante / Conductor
  tallerMecanico?: string; // Taller / Proveedor
  repuestos: SparePart[];
  precioTotal: number;
  facturaNumero: string; // N° de Factura / Comprobante
  facturaDetalle?: string; // Detalle adicional o referencia
  notas?: string;
  creadoEn: string;
}

export interface Vehicle {
  placa: string; // Primary key (e.g. P-842BKN)
  marca: string; // e.g. Toyota
  modelo: string; // e.g. Hilux
  anio: number; // e.g. 2022
  kilometrajeActual: number; // e.g. 85400
  tipoCombustible: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  asignadoA: string; // e.g. Juan Pérez - Logística
  vin?: string;
  color?: string;
  notas?: string;
  fotoUrl?: string;
  creadoEn: string;
}

export interface AlertSummary {
  alDia: number;
  proximos: number;
  vencidos: number;
  totalVehiculos: number;
  totalServicios: number;
}

export type ActiveTab = 'vehiculos' | 'fichas' | 'calendario' | 'informes' | 'alertas' | 'datos';
