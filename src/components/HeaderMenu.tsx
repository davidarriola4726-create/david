import React from 'react';
import { ActiveTab, AlertSummary } from '../types';
import { LogoIcon } from './LogoIcon';
import { Car, Calendar, FileText, AlertTriangle, Database, Wrench, ShieldAlert } from 'lucide-react';
import bgHeaderImg from '../assets/images/auto_logo_bg_1786317646915.jpg';

interface HeaderMenuProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  summary: AlertSummary;
  onOpenNewVehicle: () => void;
  onOpenNewRecord: () => void;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  activeTab,
  setActiveTab,
  summary,
  onOpenNewVehicle,
  onOpenNewRecord,
}) => {
  const tabs = [
    { id: 'vehiculos', label: 'Vehículos', icon: Car },
    { id: 'fichas', label: 'Mantenimientos', icon: Wrench },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'informes', label: 'Informes', icon: FileText },
    {
      id: 'alertas',
      label: 'Alertas',
      icon: ShieldAlert,
      badge: summary.vencidos + summary.proximos,
      badgeColor: summary.vencidos > 0 ? 'bg-red-600' : 'bg-amber-500',
    },
    { id: 'datos', label: 'Datos / Respaldo', icon: Database },
  ];

  return (
    <header className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800 shadow-2xl">
      {/* Background Image Layer with Dark Overlay & Metallic Red Accent Glow */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity scale-105 filter blur-[1px] pointer-events-none">
        <img
          src={bgHeaderImg}
          alt="Automotive Maintenance Background"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6">
          {/* Logo & Branding Title */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl ring-2 ring-red-600/30">
              <LogoIcon size={58} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-600/20 text-red-400 border border-red-500/30">
                  Control de Flotas
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">| Local Storage Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5 flex items-center gap-2">
                CONTROL DE MANTENIMIENTO
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Fichas por placa, alertas por color, calendario e informes detallados
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-inner">
            <div
              onClick={() => setActiveTab('vehiculos')}
              className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition text-center"
            >
              <div className="text-[11px] font-medium text-slate-400">Total Flota</div>
              <div className="text-lg font-bold text-slate-100">{summary.totalVehiculos} <span className="text-xs text-slate-400 font-normal">uds</span></div>
            </div>

            <div
              onClick={() => setActiveTab('alertas')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg transition text-center border ${
                summary.vencidos > 0
                  ? 'bg-red-950/40 border-red-800/60 hover:bg-red-900/40'
                  : 'bg-slate-800/50 border-transparent hover:bg-slate-800'
              }`}
            >
              <div className="text-[11px] font-medium text-red-300 flex items-center justify-center gap-1">
                {summary.vencidos > 0 && <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />}
                Vencidos
              </div>
              <div className="text-lg font-bold text-red-400">{summary.vencidos}</div>
            </div>

            <div
              onClick={() => setActiveTab('alertas')}
              className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/40 transition text-center"
            >
              <div className="text-[11px] font-medium text-amber-300">Próximos</div>
              <div className="text-lg font-bold text-amber-400">{summary.proximos}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <nav className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 ring-1 ring-red-400'
                      : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${tab.badgeColor}`}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onOpenNewVehicle}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Car className="w-3.5 h-3.5 text-red-400" />
              <span>+ Nuevo Vehículo</span>
            </button>
            <button
              onClick={onOpenNewRecord}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-950/50 active:scale-95"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ Registrar Servicio</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
