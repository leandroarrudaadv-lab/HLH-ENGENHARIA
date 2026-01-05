
import React from 'react';
import { Project } from '../types';
import { MapPin, TrendingUp, Clock, CheckCircle2, HardHat, Trash2 } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onDeleteProject?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelect, onDeleteProject }) => {
  const stats = {
    active: projects.filter(p => p.status === 'Em andamento').length,
    planning: projects.filter(p => p.status === 'Planejamento').length,
    completed: projects.filter(p => p.status === 'Concluída').length,
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Impede que abra a obra ao clicar no excluir
    if (onDeleteProject) {
      onDeleteProject(id);
    }
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
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Obras Ativas</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stats.active}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Em Planejamento</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stats.planning}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-amber-500 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Concluídas</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stats.completed}</h3>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div>
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">
          Portfólio de Obras
          <span className="text-sm font-black text-slate-400">({projects.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(p => (
            <div 
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-amber-500 hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer group flex flex-col h-full relative"
            >
              <div className="h-48 bg-slate-900 relative overflow-hidden">
                {p.mainPhoto ? (
                  <img 
                    src={p.mainPhoto} 
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 opacity-40">
                    <HardHat size={48} className="text-amber-500" />
                  </div>
                )}
                
                {/* Botão de Excluir Rápido no Card */}
                <button 
                  onClick={(e) => handleDelete(e, p.id)}
                  className="absolute top-4 left-4 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
                  title="Excluir Obra"
                >
                  <Trash2 size={16} />
                </button>

                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl border-2 ${
                    p.status === 'Em andamento' ? 'bg-green-500 text-white border-green-600' : 
                    p.status === 'Concluída' ? 'bg-slate-900 text-amber-500 border-amber-600' : 
                    'bg-amber-500 text-slate-900 border-amber-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h4 className="text-xl font-black text-slate-900 mb-1 tracking-tighter uppercase">{p.name}</h4>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">
                  <MapPin size={14} className="text-amber-500" />
                  {p.location}
                </div>
                
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Progresso</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${p.status === 'Concluída' ? 'bg-slate-900' : 'bg-amber-500'}`}
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
