
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, LayoutDashboard, HardHat, 
  ArrowLeft, Settings, Bell, Users
} from 'lucide-react';
import { Project, Employee } from './types';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import NewProjectModal from './components/NewProjectModal';
import EmployeeManagement from './components/EmployeeManagement';

const INITIAL_PROJECTS: Project[] = [
  { id: '1', name: 'FIJI', status: 'Em andamento', location: 'Orla Marítima', progress: 65, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
  { id: '2', name: 'EDMUNDO', status: 'Em andamento', location: 'Centro Histórico', progress: 42, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
  { id: '3', name: 'MONICA', status: 'Planejamento', location: 'Bairro Nobre', progress: 10, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
  { id: '4', name: 'LOURENÇO', status: 'Concluída', location: 'Zona Sul', progress: 100, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] },
];

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalEmployees, setGlobalEmployees] = useState<Employee[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'employees' | 'project'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados
  useEffect(() => {
    const savedProjects = localStorage.getItem('hlh_projects_v4');
    const savedEmployees = localStorage.getItem('hlh_employees_v4');
    
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    else setProjects(INITIAL_PROJECTS);

    if (savedEmployees) setGlobalEmployees(JSON.parse(savedEmployees));
  }, []);

  // Salvar sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('hlh_projects_v4', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('hlh_employees_v4', JSON.stringify(globalEmployees));
  }, [globalEmployees]);

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
    setCurrentView('dashboard');
  };

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (window.confirm(`TEM CERTEZA QUE DESEJA EXCLUIR A OBRA "${projectToDelete?.name}"? TODOS OS DADOS SERÃO PERDIDOS PERMANENTEMENTE.`)) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProjectId === id) {
        setCurrentView('dashboard');
        setSelectedProjectId(null);
      }
    }
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('project');
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen shadow-2xl">
        <div className="mb-10 flex items-center gap-3" onClick={() => setCurrentView('dashboard')} style={{cursor: 'pointer'}}>
          <div className="bg-amber-500 p-2 rounded-xl">
            <HardHat className="text-slate-900" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">HLH</h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black">Engenharia</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 font-black">
          <button 
            onClick={() => { setCurrentView('dashboard'); setSelectedProjectId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all uppercase text-xs tracking-widest ${currentView === 'dashboard' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <LayoutDashboard size={20} />
            PAINEL GERAL
          </button>

          <button 
            onClick={() => { setCurrentView('employees'); setSelectedProjectId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all uppercase text-xs tracking-widest ${currentView === 'employees' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Users size={20} />
            COLABORADORES
          </button>
          
          <div className="pt-6">
            <p className="text-[10px] text-slate-600 font-black uppercase px-4 mb-4 tracking-[0.3em]">Obras em Foco</p>
            <div className="space-y-1 overflow-y-auto max-h-[40vh] no-scrollbar">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] transition-all uppercase tracking-widest border border-transparent ${selectedProjectId === p.id && currentView === 'project' ? 'bg-slate-800 text-amber-500 border-slate-700' : 'hover:bg-slate-800/50 text-slate-500'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="md:hidden bg-amber-500 p-1.5 rounded-lg" onClick={() => setCurrentView('dashboard')}>
               <HardHat size={20} className="text-slate-900" />
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
              {currentView === 'dashboard' ? 'Gestão HLH' : 
               currentView === 'employees' ? 'Cadastro de Equipe' : 
               selectedProject?.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {currentView === 'dashboard' && (
              <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-xl uppercase text-xs tracking-widest"
              >
                <Plus size={18} /> NOVA OBRA
              </button>
            )}
            <button className="p-2 text-slate-400 hover:text-slate-900"><Bell size={20}/></button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          {currentView === 'project' && selectedProject ? (
            <ProjectDetail 
              project={selectedProject} 
              onUpdate={updateProject} 
              onDelete={() => deleteProject(selectedProject.id)}
              onBack={() => setCurrentView('dashboard')} 
            />
          ) : currentView === 'employees' ? (
            <EmployeeManagement 
              employees={globalEmployees} 
              setEmployees={setGlobalEmployees} 
              projects={projects} 
              onUpdateProjects={setProjects}
            />
          ) : (
            <div className="max-w-7xl mx-auto">
              <Dashboard projects={filteredProjects} onSelect={handleSelectProject} onDeleteProject={deleteProject} />
            </div>
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
