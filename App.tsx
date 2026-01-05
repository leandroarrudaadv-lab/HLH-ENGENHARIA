
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, LayoutDashboard, HardHat, 
  Users, CloudCheck, Loader2, Database, Settings, X, Save, 
  Link as LinkIcon, AlertCircle, ShieldCheck, Copy, Info, CheckCircle2, Terminal, Smartphone, Search,
  Briefcase, Home, Menu
} from 'lucide-react';
import { Project, Employee } from './types';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import NewProjectModal from './components/NewProjectModal';
import EmployeeManagement from './components/EmployeeManagement';
import { DatabaseService } from './services/databaseService';

const SQL_INSTRUCTIONS = `
-- COPIE E COLE ISSO NO "SQL EDITOR" DO SUPABASE:
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT,
  location TEXT,
  progress INTEGER,
  "mainPhoto" TEXT,
  employees JSONB DEFAULT '[]',
  reports JSONB DEFAULT '[]',
  purchases JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  presence JSONB DEFAULT '[]',
  contracts JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  active BOOLEAN DEFAULT true,
  "dailyRate" NUMERIC,
  "projectId" TEXT
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON projects FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON employees FOR ALL USING (true) WITH CHECK (true);
`;

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalEmployees, setGlobalEmployees] = useState<Employee[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'employees' | 'project' | 'settings'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'supabase' | 'apk'>('supabase');
  const [sidebarSearch, setSidebarSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');
  const [dbStatus, setDbStatus] = useState<{success?: boolean, message?: string, code?: string}>({});

  const filteredSidebarProjects = useMemo(() => {
    return projects.filter(p => p.name.toLowerCase().includes(sidebarSearch.toLowerCase()));
  }, [projects, sidebarSearch]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (DatabaseService.isConfigured()) {
        const test = await DatabaseService.testConnection();
        setDbStatus(test);
        if (!test.success) {
          const lp = localStorage.getItem('hlh_projects_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_projects_cloud_v1')!) : [];
          const le = localStorage.getItem('hlh_employees_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_employees_cloud_v1')!) : [];
          setProjects(lp);
          setGlobalEmployees(le);
          setIsLoading(false);
          return;
        }
      }
      const [loadedProjects, loadedEmployees] = await Promise.all([
        DatabaseService.getProjects(),
        DatabaseService.getEmployees()
      ]);
      setProjects(loadedProjects);
      setGlobalEmployees(loadedEmployees);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    const config = localStorage.getItem('hlh_supabase_config');
    if (config) {
      const parsed = JSON.parse(config);
      setDbUrl(parsed.url || '');
      setDbKey(parsed.key || '');
    }
  }, [loadInitialData]);

  useEffect(() => {
    if (isLoading || !DatabaseService.isConfigured() || dbStatus.code === 'MISSING_TABLES') return;
    const syncData = async () => {
      setIsSyncing(true);
      try {
        await Promise.all([
          DatabaseService.saveProjects(projects),
          DatabaseService.saveEmployees(globalEmployees)
        ]);
      } catch (error: any) {
        console.error(error);
      } finally {
        setTimeout(() => setIsSyncing(false), 500);
      }
    };
    const timer = setTimeout(syncData, 2000);
    return () => clearTimeout(timer);
  }, [projects, globalEmployees, isLoading, dbStatus.code]);

  const handleSaveConfig = async () => {
    DatabaseService.saveConfig(dbUrl, dbKey);
    const test = await DatabaseService.testConnection();
    setDbStatus(test);
    if (test.success) {
      setIsSettingsOpen(false);
      loadInitialData();
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Comando copiado!");
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
    if (window.confirm(`EXCLUIR OBRA?`)) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProjectId === id) setCurrentView('dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="bg-amber-500 p-6 rounded-[2rem] shadow-2xl animate-bounce">
          <HardHat size={64} className="text-slate-900" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">HLH ENGENHARIA</h2>
        <div className="flex items-center gap-3 text-amber-500/50 font-black text-xs uppercase tracking-widest">
          <Loader2 size={16} className="animate-spin" /> Sincronizando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-['Inter'] pb-20 md:pb-0">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-80 bg-slate-900 text-white p-8 sticky top-0 h-screen shadow-2xl z-40 overflow-hidden">
        <div className="mb-10 flex items-center gap-4 cursor-pointer" onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}}>
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <HardHat className="text-slate-900" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none italic">HLH</h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-[0.25em] font-black">Engenharia</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 flex flex-col min-h-0">
          <SideButton active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} icon={<LayoutDashboard size={20}/>} label="PAINEL GERAL" />
          <SideButton active={currentView === 'employees'} onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} icon={<Users size={20}/>} label="COLABORADORES" />
          
          <div className="pt-8 flex-1 flex flex-col min-h-0">
            <p className="text-[10px] text-slate-500 font-black uppercase px-4 mb-4 tracking-widest">Buscar Obra</p>
            <div className="px-4 mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  value={sidebarSearch}
                  onChange={e => setSidebarSearch(e.target.value)}
                  placeholder="FILTRAR..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-[10px] font-black uppercase outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {filteredSidebarProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {setSelectedProjectId(p.id); setCurrentView('project');}}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border-2 ${selectedProjectId === p.id && currentView === 'project' ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-xl' : 'hover:bg-slate-800/50 text-slate-400 border-transparent'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : p.status === 'Concluída' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${dbStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-amber-500 text-slate-900 border-amber-400 shadow-lg'}`}
           >
             <div className="flex items-center gap-3">
               {dbStatus.success ? <CloudCheck size={20} /> : <Database size={20} />}
               <span className="text-[10px] font-black uppercase tracking-widest">{dbStatus.success ? 'Nuvem Ativa' : 'CONECTAR'}</span>
             </div>
             <Settings size={16} />
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="md:hidden bg-amber-500 p-2 rounded-xl">
               <HardHat size={20} className="text-slate-900" />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tighter italic truncate max-w-[200px] md:max-w-none">
              {currentView === 'dashboard' ? 'Painel Geral' : 
               currentView === 'employees' ? 'Colaboradores' : 
               selectedProject?.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isSyncing && <Loader2 size={16} className="text-amber-500 animate-spin" />}
            {currentView === 'dashboard' && (
              <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-slate-900 text-white font-black px-4 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg text-[10px] tracking-widest hover:bg-slate-800"
              >
                <Plus size={16} /> <span className="hidden sm:inline">NOVA OBRA</span>
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8">
          {currentView === 'project' && selectedProject ? (
            <ProjectDetail project={selectedProject} onUpdate={updateProject} onDelete={() => deleteProject(selectedProject.id)} onBack={() => setCurrentView('dashboard')} />
          ) : currentView === 'employees' ? (
            <EmployeeManagement employees={globalEmployees} setEmployees={setGlobalEmployees} projects={projects} onUpdateProjects={setProjects} />
          ) : (
            <Dashboard projects={projects} onSelect={(id) => {setSelectedProjectId(id); setCurrentView('project');}} onDeleteProject={deleteProject} />
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <BottomTab active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} icon={<Home size={22}/>} label="Home" />
        <BottomTab active={currentView === 'project'} onClick={() => {
          if (projects.length > 0) {
            setSelectedProjectId(projects[0].id);
            setCurrentView('project');
          } else {
            setCurrentView('dashboard');
          }
        }} icon={<Briefcase size={22}/>} label="Obras" />
        <BottomTab active={currentView === 'employees'} onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} icon={<Users size={22}/>} label="Equipe" />
        <BottomTab active={isSettingsOpen} onClick={() => setIsSettingsOpen(true)} icon={<Settings size={22}/>} label="Ajustes" />
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
             <div className="bg-slate-900 p-6 md:p-8 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-3 rounded-2xl text-slate-900"><Settings size={24} /></div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Ajustes do App</h2>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
             </div>

             <div className="flex border-b border-slate-100">
               <button onClick={() => setSettingsTab('supabase')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${settingsTab === 'supabase' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/20' : 'text-slate-400'}`}>BANCO SUPABASE</button>
               <button onClick={() => setSettingsTab('apk')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${settingsTab === 'apk' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/20' : 'text-slate-400'}`}>GERAR APK ANDROID</button>
             </div>
             
             <div className="p-6 md:p-8 overflow-y-auto no-scrollbar space-y-6">
                {settingsTab === 'supabase' ? (
                  <div className="space-y-6">
                    <InputField label="Project URL" value={dbUrl} onChange={setDbUrl} icon={<LinkIcon size={20}/>} placeholder="https://..." />
                    <InputField label="Anon Key" value={dbKey} onChange={setDbKey} icon={<ShieldCheck size={20}/>} placeholder="Public Key..." isPassword />
                    <button onClick={handleSaveConfig} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest"><Save size={20} className="text-amber-500"/> SALVAR CONEXÃO</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-3xl flex items-start gap-4">
                      <Smartphone size={28} className="text-amber-600 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-amber-900 uppercase">Guia de Compilação (APK)</p>
                        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">Siga estes passos no seu computador para gerar o instalador do Android.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Step title="Passo 1: Instalar Ponte (Uma vez)" command="npm install @capacitor/android" onCopy={copyText} />
                      <Step title="Passo 2: Criar Pasta Android (Uma vez)" command="npx cap add android" onCopy={copyText} />
                      <Step title="Passo 3: Sincronizar Código (Sempre)" command="npx cap copy" onCopy={copyText} />
                      <Step title="Passo 4: Abrir Android Studio" command="npx cap open android" onCopy={copyText} />
                      
                      <div className="p-5 bg-slate-900 rounded-3xl text-white">
                        <p className="text-[10px] font-black text-amber-500 uppercase mb-2">GERANDO O APK FINAL</p>
                        <p className="text-[10px] font-medium leading-relaxed text-slate-300">No Android Studio, use o menu: <b>Build > Build APK(s)</b>. Aguarde e clique em "Locate".</p>
                      </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onAdd={addProject} />
    </div>
  );
};

const SideButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all uppercase text-[11px] font-black tracking-widest border-2 ${active ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-xl' : 'hover:bg-slate-800 text-slate-400 border-transparent'}`}>
    {icon} {label}
  </button>
);

const BottomTab: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-amber-500 scale-110' : 'text-slate-400'}`}>
    {icon}
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, placeholder: string, isPassword?: boolean}> = ({ label, value, onChange, icon, placeholder, isPassword }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors">{icon}</div>
      <input type={isPassword ? "password" : "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 font-black text-sm outline-none focus:border-amber-500 focus:bg-white transition-all" />
    </div>
  </div>
);

const Step: React.FC<{title: string, command: string, onCopy: (c: string) => void}> = ({ title, command, onCopy }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{title}</p>
    <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-between border border-slate-800 group">
      <code className="text-amber-400 font-mono text-[10px] overflow-hidden truncate mr-2">{command}</code>
      <button onClick={() => onCopy(command)} className="text-slate-500 hover:text-white shrink-0"><Copy size={16}/></button>
    </div>
  </div>
);

export default App;
