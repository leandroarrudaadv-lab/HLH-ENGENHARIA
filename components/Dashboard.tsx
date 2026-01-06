
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { MapPin, TrendingUp, Clock, CheckCircle2, HardHat, Trash2, Search, Filter, BarChart3, ChevronRight, X } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onDeleteProject?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelect, onDeleteProject }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todas'>('Todas');

  const stats = useMemo(() => {
    return {
      active: projects.filter(p => p.status === 'Em andamento').length,
      planning: projects.filter(p => p.status === 'Planejamento').length,
      completed: projects.filter(p => p.status === 'Concluída').length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'Todas' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteProject) {
      onDeleteProject(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatItem label="Ativas" value={stats.active} color="green" active={statusFilter === 'Em andamento'} onClick={() => setStatusFilter('Em andamento')} />
        <StatItem label="Planejamento" value={stats.planning} color="amber" active={statusFilter === 'Planejamento'} onClick={() => setStatusFilter('Planejamento')} />
        <StatItem label="Concluídas" value={stats.completed} color="blue" active={statusFilter === 'Concluída'} onClick={() => setStatusFilter('Concluída')} />
      </div>

      {/* Toolbar / Search */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="PESQUISAR OBRAS..." 
            className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 font-black uppercase text-[10px] tracking-widest outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>
        {statusFilter !== 'Todas' && (
          <button 
            onClick={() => setStatusFilter('Todas')}
            className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            Limpar Filtro <X size={14} className="text-amber-500" />
          </button>
        )}
      </div>

      {/* Grid de Obras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(p => (
          <div 
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl hover:border-amber-500 transition-all duration-500 cursor-pointer group flex flex-col h-full"
          >
            <div className="h-44 bg-slate-800 relative overflow-hidden">
              {p.mainPhoto ? (
                <img src={p.mainPhoto} alt={p.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <HardHat size={40} className="text-amber-500/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60" />
              
              <div className="absolute top-4 right-4">
                <StatusBadge status={p.status} />
              </div>

              <div className="absolute bottom-4 left-6">
                 <h4 className="text-xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-lg">{p.name}</h4>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-6">
                <MapPin size={12} className="text-amber-500" />
                <span className="truncate">{p.location}</span>
              </div>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PROGRESSO</span>
                    <span className="text-lg font-black text-slate-900 leading-none">{p.progress}%</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      p.status === 'Concluída' ? 'bg-blue-600' : 
                      p.status === 'Em andamento' ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
             <div className="flex flex-col items-center gap-4 opacity-30">
               <Search size={48} />
               <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma obra encontrada para este filtro</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem: React.FC<{label: string, value: number, color: string, active: boolean, onClick: () => void}> = ({ label, value, color, active, onClick }) => {
  const colors: any = {
    green: active ? 'bg-green-500 text-white' : 'bg-white text-green-600 border-slate-100',
    amber: active ? 'bg-amber-500 text-slate-900' : 'bg-white text-amber-600 border-slate-100',
    blue: active ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-slate-100'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex-1 p-4 rounded-3xl border transition-all text-center flex flex-col items-center gap-1 shadow-sm ${colors[color]}`}
    >
      <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'opacity-80' : 'text-slate-400'}`}>{label}</span>
      <span className="text-xl font-black tracking-tighter">{value}</span>
    </button>
  );
};

const StatusBadge: React.FC<{status: string}> = ({ status }) => {
  const styles: any = {
    'Em andamento': 'bg-green-500 text-white border-green-400',
    'Concluída': 'bg-blue-600 text-white border-blue-500',
    'Planejamento': 'bg-amber-500 text-slate-900 border-amber-400'
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
