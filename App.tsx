
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  HardHat, 
  Camera, 
  FileText, 
  Users, 
  ShoppingCart, 
  ArrowLeft,
  Settings,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Project, ProjectStatus } from './types';
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

  // Carregar dados iniciais
  useEffect(() => {
    const saved = localStorage.getItem('hlh_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
        setProjects(INITIAL_PROJECTS);
      }
    } else {
      setProjects(INITIAL_PROJECTS);
    }
  }, []);

  // Salvar sempre que houver mudança nos projetos
  useEffect(() => {
    localStorage.setItem('hlh_projects', JSON.stringify(projects));
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen">
        <div className="mb-10 flex items-center gap-2">
          <div className="bg-amber-500 p-2 rounded-lg">
            <HardHat className="text-slate-900" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HLH</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Engenharia</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${!selectedProjectId ? 'bg-amber-500 text-slate-900 font-bold' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <div className="pt-4 pb-2">
            <p className="text-xs text-slate-500 font-black uppercase px-4 mb-2 tracking-widest">Obras</p>
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${selectedProjectId === p.id ? 'bg-slate-700 text-amber-500 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <div className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : p.status === 'Concluída' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                {p.name}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors w-full font-bold">
            <Settings size={20} />
            Configurações
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {selectedProjectId && (
              <button 
                onClick={() => setSelectedProjectId(null)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-black text-slate-900 truncate uppercase tracking-tight">
              {selectedProjectId ? selectedProject?.name : 'Dashboard Geral'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar obra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none w-48 lg:w-64"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {!selectedProjectId && (
              <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Nova Obra</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {selectedProjectId && selectedProject ? (
            <ProjectDetail 
              project={selectedProject} 
              onUpdate={updateProject} 
              onBack={() => setSelectedProjectId(null)} 
            />
          ) : (
            <Dashboard 
              projects={filteredProjects} 
              onSelect={setSelectedProjectId} 
            />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t border-slate-200 grid grid-cols-3 p-2 sticky bottom-0 z-20">
        <button 
          onClick={() => setSelectedProjectId(null)}
          className={`flex flex-col items-center p-2 rounded-lg ${!selectedProjectId ? 'text-amber-500' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] mt-1 font-black uppercase">Início</span>
        </button>
        <button 
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex flex-col items-center p-2 text-slate-400"
        >
          <Plus size={24} />
          <span className="text-[10px] mt-1 font-black uppercase">Adicionar</span>
        </button>
        <button className="flex flex-col items-center p-2 text-slate-400">
          <Settings size={24} />
          <span className="text-[10px] mt-1 font-black uppercase">Ajustes</span>
        </button>
      </nav>

      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onAdd={addProject} 
      />
    </div>
  );
};

export default App;
