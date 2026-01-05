
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, LayoutDashboard, HardHat, 
  ArrowLeft, Settings, Bell
} from 'lucide-react';
import { Project } from './types';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import NewProjectModal from './components/NewProjectModal';

const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'FIJI', status: 'Em andamento', location: 'Orla Marítima', progress: 65, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
  { id: '2', name: 'EDMUNDO', status: 'Em andamento', location: 'Centro Histórico', progress: 42, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
  { id: '3', name: 'MONICA', status: 'Planejamento', location: 'Bairro Nobre', progress: 10, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
  { id: '4', name: 'LOURENÇO', status: 'Concluída', location: 'Zona Sul', progress: 100, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
];

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('hlh_projects_v2');
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      setProjects(INITIAL_PROJECTS);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('hlh_projects_v2', JSON.stringify(projects));
    }
  }, [projects]);

  const addProject = (name: string, location: string) => {
    const newProj: Project = {
      id: Date.now().toString(),
      name: name.toUpperCase(),
      status: 'Planejamento',
      location,
      progress: 0,
      employees: [],
      reports: [],
      purchases: [],
      photos: [],
      presence: [],
      contracts: [],
      documents: []
    };
    setProjects(prev => [...prev, newProj]);
    setIsNewProjectModalOpen(false);
  };

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen shadow-2xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl">
            <HardHat className="text-slate-900" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">HLH</h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black">Engenharia</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 font-black">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all uppercase text-xs tracking-widest ${!selectedProjectId ? 'bg-amber-500 text-slate-900' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <LayoutDashboard size={20} />
            DASHBOARD
          </button>
          
          <div className="pt-6 pb-2">
            <p className="text-[10px] text-slate-600 font-black uppercase px-4 mb-4 tracking-[0.3em]">Obras em Foco</p>
            <div className="space-y-1">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] transition-all uppercase tracking-widest border border-transparent ${selectedProjectId === p.id ? 'bg-slate-800 text-amber-500 border-slate-700' : 'hover:bg-slate-800/50 text-slate-500'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
              {selectedProjectId ? selectedProject?.name : 'HLH - Painel Geral'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {!selectedProjectId && (
              <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-xl uppercase text-xs tracking-widest"
              >
                <Plus size={18} /> NOVA OBRA
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          {selectedProjectId && selectedProject ? (
            <ProjectDetail 
              project={selectedProject} 
              onUpdate={updateProject} 
              onBack={() => setSelectedProjectId(null)} 
            />
          ) : (
            <Dashboard projects={filteredProjects} onSelect={setSelectedProjectId} />
          )}
        </div>
      </main>

      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onAdd={addProject} 
      />
    </div>
  );
};

export default App;
