
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, LayoutDashboard, HardHat, 
  Bell, Users, Cloud, CloudCheck, Loader2, RefreshCw, Database, Settings, X, Save, Link as LinkIcon, AlertCircle, ShieldCheck
} from 'lucide-react';
import { Project, Employee } from './types';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import NewProjectModal from './components/NewProjectModal';
import EmployeeManagement from './components/EmployeeManagement';
import { DatabaseService } from './services/databaseService';

// Main App component for HLH Engenharia
const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalEmployees, setGlobalEmployees] = useState<Employee[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'employees' | 'project'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  
  // Config States
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setSyncError(false);
    try {
      const [loadedProjects, loadedEmployees] = await Promise.all([
        DatabaseService.getProjects(),
        DatabaseService.getEmployees()
      ]);
      setProjects(loadedProjects);
      setGlobalEmployees(loadedEmployees);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setSyncError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    // Preencher campos se já houver config
    const config = localStorage.getItem('hlh_supabase_config');
    if (config) {
      const parsed = JSON.parse(config);
      setDbUrl(parsed.url || '');
      setDbKey(parsed.key || '');
    }
  }, [loadInitialData]);

  useEffect(() => {
    if (isLoading) return;
    
    const syncData = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([
          DatabaseService.saveProjects(projects),
          DatabaseService.saveEmployees(globalEmployees)
        ]);
        setSyncError(false);
      } catch (error) {
        console.error("Erro na sincronização:", error);
        setSyncError(true);
      } finally {
        setTimeout(() => setIsSyncing(false), 500);
      }
    };

    const timer = setTimeout(syncData, 1500);
    return () => clearTimeout(timer);
  }, [projects, globalEmployees, isLoading]);

  const handleSaveConfig = () => {
    if (dbUrl && !dbUrl.startsWith('http')) {
      alert('Por favor, insira uma URL válida do Supabase (começando com https://)');
      return;
    }
    DatabaseService.saveConfig(dbUrl, dbKey);
    setIsSettingsOpen(false);
    loadInitialData();
  };

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
    if (window.confirm(`EXCLUIR OBRA "${projectToDelete?.name}"?`)) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="bg-amber-500 p-4 rounded-3xl shadow-2xl animate-bounce">
          <HardHat size={48} className="text-slate-900" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">HLH Engenharia</h2>
          <div className="flex items-center justify-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mt-2">
            <Loader2 size={14} className="animate-spin text-amber-500" />
            Conectando...
          </div>
        </div>
      </div>
    );
  }

  const isConfigured = DatabaseService.isConfigured();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen shadow-2xl">
        <div className="mb-10 flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
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
            <div className="space-y-1 overflow-y-auto max-h-[35vh] no-scrollbar">
              {projects.length === 0 ? (
                <p className="px-4 text-[9px] text-slate-600 uppercase font-bold italic">Nenhuma obra cadastrada</p>
              ) : (
                projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] transition-all uppercase tracking-widest border border-transparent ${selectedProjectId === p.id && currentView === 'project' ? 'bg-slate-800 text-amber-500 border-slate-700' : 'hover:bg-slate-800/50 text-slate-500'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : p.status === 'Concluída' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                    {p.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
           {!isConfigured ? (
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-500 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-amber-500 hover:text-slate-900 transition-all group animate-pulse hover:animate-none"
             >
               <Cloud size={20} />
               <span className="text-[9px] font-black uppercase tracking-widest">Ativar Supabase</span>
             </button>
           ) : (
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   {/* Completed truncated line and status UI */}
                   <div className={`w-2 h-2 rounded-full ${syncError ? 'bg-red-500' : isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                     {syncError ? 'Erro Sinc' : isSyncing ? 'Sincronizando' : 'Nuvem Ativa'}
                   </span>
                 </div>
                 <button onClick={() => setIsSettingsOpen(true)} className="text-slate-500 hover:text-amber-500 transition-colors">
                   <Settings size={14} />
                 </button>
               </div>
             </div>
           )}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div className="md:hidden flex items-center gap-3" onClick={() => setCurrentView('dashboard')}>
            <div className="bg-amber-500 p-2 rounded-xl">
              <HardHat className="text-slate-900" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">HLH</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {currentView === 'dashboard' && (
              <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
              >
                <Plus size={18} /> NOVA OBRA
              </button>
            )}
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <Dashboard projects={projects} onSelect={handleSelectProject} onDeleteProject={deleteProject} />
        )}
        {currentView === 'employees' && (
          <EmployeeManagement employees={globalEmployees} setEmployees={setGlobalEmployees} projects={projects} onUpdateProjects={setProjects} />
        )}
        {currentView === 'project' && selectedProject && (
          <ProjectDetail 
            project={selectedProject} 
            onUpdate={updateProject} 
            onDelete={() => deleteProject(selectedProject.id)}
            onBack={() => { setCurrentView('dashboard'); setSelectedProjectId(null); }}
          />
        )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Database size={20} className="text-amber-500" />
                Configurar Supabase
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Supabase URL</label>
                <input 
                  type="text" 
                  value={dbUrl} 
                  onChange={e => setDbUrl(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 font-black text-sm outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="https://your-project.supabase.co" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Anon Key</label>
                <input 
                  type="password" 
                  value={dbKey} 
                  onChange={e => setDbKey(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 font-black text-sm outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="sua-chave-anon-aqui" 
                />
              </div>
              <button 
                onClick={handleSaveConfig}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-xl mt-4"
              >
                <Save size={18} /> Salvar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onAdd={addProject} 
      />
    </div>
  );
};

// Fixed: Add default export to resolve the module error in index.tsx
export default App;
