import { AlertStatus, ServiceRecord, Vehicle } from '../types';

/**
 * Calculates alert status based on vehicle current odometer reading and current date
 */
export function calculateRecordStatus(record: ServiceRecord, vehicle?: Vehicle): AlertStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isVencido = false;
  let isProximo = false;

  // Check date criteria
  if (record.proximaFecha) {
    const dueDate = new Date(record.proximaFecha);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      isVencido = true;
    } else if (diffDays <= 15) {
      isProximo = true;
    }
  }

  // Check mileage criteria if vehicle provided
  if (vehicle && record.proximoKilometraje && record.proximoKilometraje > 0) {
    const kmRemaining = record.proximoKilometraje - vehicle.kilometrajeActual;

    if (kmRemaining <= 0) {
      isVencido = true;
    } else if (kmRemaining <= 1000) {
      isProximo = true;
    }
  }

  if (isVencido) return 'vencido';
  if (isProximo) return 'proximo';
  return 'al_dia';
}

/**
 * Overall vehicle status based on its worst service record status
 */
export function getVehicleOverallStatus(vehicle: Vehicle, records: ServiceRecord[]): AlertStatus {
  const vehicleRecords = records.filter((r) => r.placa === vehicle.placa);
  if (vehicleRecords.length === 0) return 'al_dia';

  let hasProximo = false;
  for (const r of vehicleRecords) {
    const status = calculateRecordStatus(r, vehicle);
    if (status === 'vencido') return 'vencido';
    if (status === 'proximo') hasProximo = true;
  }

  return hasProximo ? 'proximo' : 'al_dia';
}

/**
 * Returns formatted status badge config
 */
export function getStatusBadge(status: AlertStatus) {
  switch (status) {
    case 'vencido':
      return {
        label: 'VENCIDO',
        colorClass: 'bg-red-950/80 text-red-400 border-red-800/60 ring-red-500/30',
        bgDot: 'bg-red-500 animate-pulse',
        textHex: '#EF4444',
      };
    case 'proximo':
      return {
        label: 'PRÓXIMO',
        colorClass: 'bg-amber-950/80 text-amber-400 border-amber-800/60 ring-amber-500/30',
        bgDot: 'bg-amber-400',
        textHex: '#F59E0B',
      };
    case 'al_dia':
    default:
      return {
        label: 'AL DÍA',
        colorClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 ring-emerald-500/30',
        bgDot: 'bg-emerald-500',
        textHex: '#10B981',
      };
  }
}

/**
 * Formats currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats numbers with thousand separators
 */
export function formatKm(km: number): string {
  return `${new Intl.NumberFormat('es-MX').format(km)} km`;
}

/**
 * Formats ISO date to readable string (e.g., 15 de Ago, 2026)
 */
export function formatDateReadable(dateStr?: string): string {
  if (!dateStr) return 'No definida';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculates initial seed data for immediate rich visual presentation
 */
export function getInitialSeedData(): { vehicles: Vehicle[]; records: ServiceRecord[] } {
  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  const addDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  };

  const vehicles: Vehicle[] = [
    {
      placa: 'P-842BKN',
      marca: 'Toyota',
      modelo: 'Hilux 4x4',
      anio: 2022,
      kilometrajeActual: 85400,
      tipoCombustible: 'Diésel',
      asignadoA: 'Ing. Roberto Gómez - Operaciones',
      color: 'Blanco',
      vin: '7ATY1928401928340',
      notas: 'Unidad asignada a supervisión de campo y rutas rurales.',
      creadoEn: formatYMD(addDays(today, -180)),
    },
    {
      placa: 'P-109CXZ',
      marca: 'Nissan',
      modelo: 'NP300 Pick-Up',
      anio: 2021,
      kilometrajeActual: 112300,
      tipoCombustible: 'Gasolina',
      asignadoA: 'Carlos Mendoza - Logística y Entregas',
      color: 'Gris Plata',
      vin: '3N182930192838190',
      notas: 'Requiere revisión constante de amortiguadores por carga pesada.',
      creadoEn: formatYMD(addDays(today, -200)),
    },
    {
      placa: 'P-552KMY',
      marca: 'Honda',
      modelo: 'CR-V Executive',
      anio: 2023,
      kilometrajeActual: 42100,
      tipoCombustible: 'Gasolina',
      asignadoA: 'Dra. Elena Ramos - Gerencia General',
      color: 'Negro Azabache',
      vin: 'JHM82910392810392',
      notas: 'Unidad de gerencia. Mantenimiento exclusivo en agencia.',
      creadoEn: formatYMD(addDays(today, -120)),
    },
    {
      placa: 'P-991TRF',
      marca: 'Volvo',
      modelo: 'FH16 Heavy Hauler',
      anio: 2020,
      kilometrajeActual: 245000,
      tipoCombustible: 'Diésel',
      asignadoA: 'Mariano Ruiz - Transporte Pesado',
      color: 'Rojo Carmesí',
      vin: 'YV293810293810293',
      notas: 'Tráiler para rutas interurbanas de larga distancia.',
      creadoEn: formatYMD(addDays(today, -300)),
    },
  ];

  const records: ServiceRecord[] = [
    // P-842BKN (Toyota Hilux) - One VENCIDO, One AL DIA
    {
      id: 'REC-001',
      placa: 'P-842BKN',
      tipo: 'Cambio',
      titulo: 'Cambio de Aceite Sintético 5W-30 y Filtro de Aire',
      fecha: formatYMD(addDays(today, -120)),
      kilometrajeRealizado: 75000,
      proximaFecha: formatYMD(addDays(today, -10)), // VENCIDO by date
      proximoKilometraje: 85000, // VENCIDO by km (current 85400)
      problemaInfo: 'Pérdida de viscosidad tras viaje largo en terracería.',
      solicitante: 'Ing. Roberto Gómez',
      tallerMecanico: 'Servispeed Automotriz',
      repuestos: [
        { id: 'p1', nombre: 'Aceite Sintético 5W30 Castrol (Galón)', cantidad: 2, precioUnitario: 850 },
        { id: 'p2', nombre: 'Filtro de Aceite Toyota OEM', cantidad: 1, precioUnitario: 320 },
        { id: 'p3', nombre: 'Filtro de Aire Alto Flujo', cantidad: 1, precioUnitario: 450 },
      ],
      precioTotal: 2470,
      facturaNumero: 'F-88219',
      facturaDetalle: 'Facturado a nombre de Flotas de Norte S.A.',
      notas: 'Revisión suplementaria de niveles de refrigerante ok.',
      creadoEn: formatYMD(addDays(today, -120)),
    },
    {
      id: 'REC-002',
      placa: 'P-842BKN',
      tipo: 'Reparación',
      titulo: 'Sustitución de Pastillas de Freno Delanteras',
      fecha: formatYMD(addDays(today, -45)),
      kilometrajeRealizado: 82000,
      proximaFecha: formatYMD(addDays(today, 120)),
      proximoKilometraje: 102000,
      problemaInfo: 'Chirrido agudo en rueda delantera izquierda al frenar.',
      solicitante: 'Ing. Roberto Gómez',
      tallerMecanico: 'Frenos y Embrayes El Sol',
      repuestos: [
        { id: 'p4', nombre: 'Pastillas Ceramicas Brembo Front', cantidad: 1, precioUnitario: 1850 },
        { id: 'p5', nombre: 'Líquido de Frenos DOT 4 500ml', cantidad: 2, precioUnitario: 180 },
      ],
      precioTotal: 2500,
      facturaNumero: 'F-90142',
      facturaDetalle: 'Incluye rectificación de discos delanteros y mano de obra.',
      notas: 'Discos rectificados a tolerancia de fabricante.',
      creadoEn: formatYMD(addDays(today, -45)),
    },

    // P-109CXZ (Nissan NP300) - One PROXIMO, One AL DIA
    {
      id: 'REC-003',
      placa: 'P-109CXZ',
      tipo: 'Mantenimiento',
      titulo: 'Mantenimiento Preventivo de 110,000 km',
      fecha: formatYMD(addDays(today, -60)),
      kilometrajeRealizado: 105000,
      proximaFecha: formatYMD(addDays(today, 5)), // PROXIMO (5 days away)
      proximoKilometraje: 113000, // PROXIMO (700 km remaining)
      problemaInfo: 'Vibración ligera en volante a más de 80 km/h.',
      solicitante: 'Carlos Mendoza',
      tallerMecanico: 'Taller Central Nissan',
      repuestos: [
        { id: 'p6', nombre: 'Kit Bujías Iridium Laser', cantidad: 4, precioUnitario: 290 },
        { id: 'p7', nombre: 'Limpiador de Inyectores', cantidad: 1, precioUnitario: 220 },
      ],
      precioTotal: 3100,
      facturaNumero: 'FAC-2024-551',
      facturaDetalle: 'Incluye alineación y balanceo computarizado.',
      notas: 'Sugerido revisión de bujes en próximo servicio.',
      creadoEn: formatYMD(addDays(today, -60)),
    },

    // P-552KMY (Honda CR-V) - ALL AL DIA
    {
      id: 'REC-004',
      placa: 'P-552KMY',
      tipo: 'Servicio',
      titulo: 'Inspección de Sistemas Electrónicos y Batería',
      fecha: formatYMD(addDays(today, -20)),
      kilometrajeRealizado: 40000,
      proximaFecha: formatYMD(addDays(today, 160)),
      proximoKilometraje: 50000,
      problemaInfo: 'Aviso esporádico de presión de neumáticos en tablero.',
      solicitante: 'Dra. Elena Ramos',
      tallerMecanico: 'Agencia Honda Premium',
      repuestos: [
        { id: 'p8', nombre: 'Batería LTH AGM 12V High Performance', cantidad: 1, precioUnitario: 3800 },
        { id: 'p9', nombre: 'Sensor TPMS de Reemplazo', cantidad: 1, precioUnitario: 1200 },
      ],
      precioTotal: 5600,
      facturaNumero: 'HON-99212',
      facturaDetalle: 'Servicio bajo garantía extendida parcial.',
      creadoEn: formatYMD(addDays(today, -20)),
    },

    // P-991TRF (Volvo Truck) - One VENCIDO
    {
      id: 'REC-005',
      placa: 'P-991TRF',
      tipo: 'Reparación',
      titulo: 'Cambio de Neumáticos de Tracción Traseros (x4)',
      fecha: formatYMD(addDays(today, -150)),
      kilometrajeRealizado: 220000,
      proximaFecha: formatYMD(addDays(today, -2)), // VENCIDO
      proximoKilometraje: 240000, // VENCIDO (Current 245000)
      problemaInfo: 'Desgaste severo en banda de rodamiento trasera derecha.',
      solicitante: 'Mariano Ruiz',
      tallerMecanico: 'Michelin Truck Center',
      repuestos: [
        { id: 'p10', nombre: 'Llantas Michelin 295/80 R22.5 Heavy Load', cantidad: 4, precioUnitario: 8900 },
      ],
      precioTotal: 38400,
      facturaNumero: 'MICH-88120',
      facturaDetalle: 'Incluye montaje, válvulas de seguridad y balanceo pesado.',
      notas: 'Urgente revisión de alineación del eje direccional.',
      creadoEn: formatYMD(addDays(today, -150)),
    },
  ];

  return { vehicles, records };
}
