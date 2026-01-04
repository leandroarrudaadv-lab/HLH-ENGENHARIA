
import React from 'react';
import { Project } from '../types';
import { MapPin, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelect: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelect }) => {
  const stats = {
    active: projects.filter(p => p.status === 'Em andamento').length,
    planning: projects.filter(p => p.status === 'Planejamento').length,
    completed: projects.filter(p => p.status === 'Concluída').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Obras Ativas</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Em Planejamento</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.planning}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Concluídas</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.completed}</h3>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          Portfólio de Obras
          <span className="text-sm font-normal text-slate-400">({projects.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(p => (
            <div 
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-500/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
            >
              <div className="h-40 bg-slate-200 relative">
                {/* Fallback image */}
                <img 
                  src={`https://picsum.photos/seed/${p.id}/600/400`} 
                  alt={p.name}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                    p.status === 'Em andamento' ? 'bg-green-500 text-white border-green-600' : 
                    p.status === 'Concluída' ? 'bg-blue-500 text-white border-blue-600' : 
                    'bg-amber-500 text-slate-900 border-amber-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-1">{p.name}</h4>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <MapPin size={14} />
                  {p.location}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-400">
                    <span>Progresso</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${p.status === 'Concluída' ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
