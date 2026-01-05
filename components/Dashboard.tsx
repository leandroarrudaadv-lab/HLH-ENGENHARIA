
import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { MapPin, TrendingUp, Clock, CheckCircle2, HardHat, Trash2, Search, Filter } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onDeleteProject?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelect, onDeleteProject }) => {
  const [search, setSearch] = useState('');

  const stats = {
    active: projects.filter(p => p.status === 'Em andamento').length,
    planning: projects.filter(p => p.status === 'Planejamento').length,
    completed: projects.filter(p => p.status === 'Concluída').length,
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteProject) {
      onDeleteProject(id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={<TrendingUp size={24}/>} label="Obras Ativas" value={stats.active} color="green" />
        <StatCard icon={<Clock size={24}/>} label="Em Planejamento" value={stats.planning} color="amber" />
        <StatCard icon={<CheckCircle2 size={24}/>} label="Concluídas" value={stats.completed} color="blue" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex-1 w-full relative">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="PROCURAR POR NOME DA OBRA OU LOCALIZAÇÃO..." 
            className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 font-black uppercase text-xs tracking-widest outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Filter size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Total de {filteredProjects.length} obras</span>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProjects.map(p => (
          <div 
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 hover:border-amber-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col h-full relative"
          >
            <div className="h-56 bg-slate-900 relative overflow-hidden">
              {p.mainPhoto ? (
                <img src={p.mainPhoto} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 opacity-40">
                  <HardHat size={56} className="text-amber-500" />
                </div>
              )}
              
              <button 
                onClick={(e) => handleDelete(e, p.id)}
                className="absolute top-6 left-6 p-3 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-10 shadow-xl"
              >
                <Trash2 size={18} />
              </button>

              <div className="absolute top-6 right-6">
                <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl border-2 ${
                  p.status === 'Em andamento' ? 'bg-green-500 text-white border-green-600' : 
                  p.status === 'Concluída' ? 'bg-blue-600 text-white border-blue-700' : 
                  'bg-amber-500 text-slate-900 border-amber-600'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-1">
              <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter uppercase leading-tight">{p.name}</h4>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">
                <MapPin size={14} className="text-amber-500" />
                {p.location}
              </div>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span>Conclusão</span>
                  <span className="text-slate-900">{p.progress}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${p.status === 'Concluída' ? 'bg-blue-600' : 'bg-amber-500'}`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-200 rounded-[3rem] opacity-20">
             <Search size={64} className="mx-auto mb-4" />
             <p className="text-sm font-black uppercase tracking-widest">Nenhuma obra encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{icon: React.ReactNode, label: string, value: number, color: 'green' | 'amber' | 'blue'}> = ({ icon, label, value, color }) => {
  const bgColors = { green: 'bg-green-50 text-green-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600' };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex items-center gap-6">
      <div className={`p-5 rounded-2xl ${bgColors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default Dashboard;
