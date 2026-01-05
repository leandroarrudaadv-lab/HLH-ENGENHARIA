
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, LayoutDashboard, HardHat, 
  Users, CloudCheck, Loader2, Database, Settings, X, Save, 
  Link as LinkIcon, ShieldCheck, Copy, Info, CheckCircle2, Play, Package, FolderOpen, Building2, Search, Briefcase, Home, Terminal, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Project, Employee } from './types';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import NewProjectModal from './components/NewProjectModal';
import EmployeeManagement from './components/EmployeeManagement';
import { DatabaseService } from './services/databaseService';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalEmployees, setGlobalEmployees] = useState<Employee[]>([]);
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('hlh_company_name') || 'HLH ENGENHARIA');
  const [currentView, setCurrentView] = useState<'dashboard' | 'employees' | 'project' | 'settings'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'geral' | 'supabase' | 'sql' | 'apk'>('geral');
  const [sidebarSearch, setSidebarSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');
  const [dbStatus, setDbStatus] = useState<{success?: boolean, message?: string, code?: string}>({});

  const loadInitialData = useCallback(async (forceCloud = false) => {
    if (!forceCloud) setIsLoading(true);
    else setIsSyncing(true);

    try {
      if (DatabaseService.isConfigured()) {
        const test = await DatabaseService.testConnection();
        setDbStatus(test);
        
        if (test.success) {
          const [loadedProjects, loadedEmployees] = await Promise.all([
            DatabaseService.getProjects(),
            DatabaseService.getEmployees()
          ]);
          
          if (forceCloud || loadedProjects.length > 0) {
            setProjects(loadedProjects);
            setGlobalEmployees(loadedEmployees);
            if (!forceCloud) setIsLoading(false);
            return;
          }
        }
      }
      
      const lp = localStorage.getItem('hlh_projects_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_projects_cloud_v1')!) : [];
      const le = localStorage.getItem('hlh_employees_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_employees_cloud_v1')!) : [];
      setProjects(lp);
      setGlobalEmployees(le);
    } catch (error: any) {
      console.error("Erro ao carregar:", error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
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
    if (isLoading) return;
    localStorage.setItem('hlh_projects_cloud_v1', JSON.stringify(projects));
    localStorage.setItem('hlh_employees_cloud_v1', JSON.stringify(globalEmployees));

    if (DatabaseService.isConfigured() && dbStatus.success) {
      const syncData = async () => {
        setIsSyncing(true);
        try {
          await Promise.all([
            DatabaseService.saveProjects(projects),
            DatabaseService.saveEmployees(globalEmployees)
          ]);
        } catch (error: any) {
          console.error("Erro sincronização:", error);
        } finally {
          setTimeout(() => setIsSyncing(false), 1000);
        }
      };
      const timer = setTimeout(syncData, 2000);
      return () => clearTimeout(timer);
    }
  }, [projects, globalEmployees, isLoading, dbStatus.success]);

  const handleManualSync = () => loadInitialData(true);

  const handleSaveConfig = async () => {
    DatabaseService.saveConfig(dbUrl, dbKey);
    const test = await DatabaseService.testConnection();
    setDbStatus(test);
    if (test.success) {
      setSettingsTab('geral');
      loadInitialData(true);
    }
  };

  const sqlCode = `create table if not exists projects (id text primary key, name text, status text, location text, progress int, "mainPhoto" text, employees jsonb default '[]', reports jsonb default '[]', purchases jsonb default '[]', photos jsonb default '[]', presence jsonb default '[]', contracts jsonb default '[]', documents jsonb default '[]', created_at timestamp with time zone default now()); \n\n create table if not exists employees (id text primary key, name text, role text, active boolean default true, "dailyRate" numeric, "projectId" text, created_at timestamp with time zone default now()); \n\n alter table projects disable row level security; alter table employees disable row level security;`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="bg-amber-500 p-6 rounded-[2rem] shadow-2xl animate-bounce mb-6">
          <HardHat size={64} className="text-slate-900" />
        </div>
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Carregando Sistema...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-['Inter'] pb-20 md:pb-0">
      <aside className="hidden md:flex flex-col w-80 bg-slate-900 text-white p-8 sticky top-0 h-screen shadow-2xl z-40">
        <div className="mb-10 flex items-center gap-4 cursor-pointer" onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}}>
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg"><Building2 className="text-slate-900" size={32} /></div>
          <div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase">{companyName}</h1>
            <p className="text-[9px] text-amber-500 uppercase tracking-widest font-black">Engenharia e Gestão</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
          <SideButton active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} icon={<LayoutDashboard size={20}/>} label="PAINEL GERAL" />
          <SideButton active={currentView === 'employees'} onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} icon={<Users size={20}/>} label="EQUIPE" />
          
          <div className="pt-8 space-y-2">
            <p className="text-[10px] text-slate-500 font-black uppercase px-4 mb-2 tracking-widest">Suas Obras</p>
            {projects.map(p => (
              <button key={p.id} onClick={() => {setSelectedProjectId(p.id); setCurrentView('project');}} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest border-2 ${selectedProjectId === p.id && currentView === 'project' ? 'bg-amber-500 text-slate-900 border-amber-400' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
                <div className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <button onClick={() => setIsSettingsOpen(true)} className={`mt-auto flex items-center justify-between p-4 rounded-2xl border-2 ${dbStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-amber-500 text-slate-900 border-amber-400'}`}>
          <div className="flex items-center gap-2">
            {dbStatus.success ? <CloudCheck size={18} /> : <Database size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{dbStatus.success ? 'CONECTADO' : 'DESCONECTADO'}</span>
          </div>
          <Settings size={16} />
        </button>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              {currentView === 'dashboard' ? 'Painel Geral' : currentView === 'employees' ? 'Gestão de Equipe' : selectedProject?.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full ${dbStatus.success ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                 {dbStatus.success ? 'Nuvem Ativa' : 'Modo Offline'}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleManualSync} className={`p-3 rounded-xl border-2 transition-all ${isSyncing ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-100 text-slate-400 hover:text-amber-500'}`}>
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            {currentView === 'dashboard' && (
              <button onClick={() => setIsNewProjectModalOpen(true)} className="bg-slate-900 text-white font-black px-4 py-3 rounded-xl flex items-center gap-2 text-[10px] tracking-widest shadow-lg">
                <Plus size={16} /> ADICIONAR
              </button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8">
          {currentView === 'project' && selectedProject ? (
            <ProjectDetail project={selectedProject} onUpdate={(u) => setProjects(prev => prev.map(p => p.id === u.id ? u : p))} onDelete={() => {setProjects(prev => prev.filter(p => p.id !== selectedProjectId)); setCurrentView('dashboard');}} onBack={() => setCurrentView('dashboard')} />
          ) : currentView === 'employees' ? (
            <EmployeeManagement employees={globalEmployees} setEmployees={setGlobalEmployees} projects={projects} onUpdateProjects={setProjects} />
          ) : (
            <Dashboard projects={projects} onSelect={(id) => {setSelectedProjectId(id); setCurrentView('project');}} onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))} />
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-50 shadow-2xl">
        <BottomTab active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} icon={<Home size={22}/>} label="Home" />
        <BottomTab active={currentView === 'employees'} onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} icon={<Users size={22}/>} label="Equipe" />
        <BottomTab active={isSettingsOpen} onClick={() => setIsSettingsOpen(true)} icon={<Settings size={22}/>} label="Ajustes" />
      </nav>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Configurações</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
             </div>
             <div className="flex border-b border-slate-100">
               <button onClick={() => setSettingsTab('geral')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${settingsTab === 'geral' ? 'text-amber-500 border-b-4 border-amber-500' : 'text-slate-400'}`}>GERAL</button>
               <button onClick={() => setSettingsTab('supabase')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${settingsTab === 'supabase' ? 'text-amber-500 border-b-4 border-amber-500' : 'text-slate-400'}`}>CONEXÃO</button>
               <button onClick={() => setSettingsTab('sql')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${settingsTab === 'sql' ? 'text-amber-500 border-b-4 border-amber-500' : 'text-slate-400'}`}>SQL SETUP</button>
             </div>
             <div className="p-8 overflow-y-auto space-y-6">
                {settingsTab === 'geral' ? (
                  <InputField label="Nome da Construtora" value={companyName} onChange={v => setCompanyName(v.toUpperCase())} icon={<Building2 size={20}/>} placeholder="HLH ENGENHARIA" />
                ) : settingsTab === 'supabase' ? (
                  <div className="space-y-4">
                    <InputField label="URL do Supabase" value={dbUrl} onChange={setDbUrl} icon={<LinkIcon size={20}/>} placeholder="https://..." />
                    <InputField label="Chave Anon (Public)" value={dbKey} onChange={setDbKey} icon={<ShieldCheck size={20}/>} placeholder="Chave..." isPassword />
                    <button onClick={handleSaveConfig} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-xl"><Save size={18} className="text-amber-500"/> SALVAR CONEXÃO</button>
                    {dbStatus.message && (
                      <div className={`p-4 rounded-xl text-[9px] font-black uppercase text-center border-2 ${dbStatus.success ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        {dbStatus.message}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900 p-6 rounded-3xl space-y-4 border-2 border-amber-500/20">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                       <Terminal size={20} />
                       <span className="font-black text-xs uppercase tracking-widest">Script SQL Editor</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase">Copie e rode no SQL Editor do seu Supabase para criar as tabelas necessárias:</p>
                    <pre className="bg-black/50 p-4 rounded-xl text-[9px] text-amber-500/80 font-mono overflow-x-auto border border-white/5">
                      {sqlCode}
                    </pre>
                    <button onClick={() => {navigator.clipboard.writeText(sqlCode); alert('Copiado!');}} className="w-full bg-amber-500 text-slate-900 font-black py-3 rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                       <Copy size={16} /> COPIAR CÓDIGO
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onAdd={(n, l) => {
        const p: Project = { id: Date.now().toString(), name: n.toUpperCase(), status: 'Planejamento', location: l, progress: 0, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] };
        setProjects(prev => [p, ...prev]);
        setIsNewProjectModalOpen(false);
      }} />
    </div>
  );
};

const SideButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all uppercase text-[10px] font-black tracking-widest border-2 ${active ? 'bg-amber-500 text-slate-900 border-amber-400' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
    {icon} {label}
  </button>
);

const BottomTab: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-amber-500 scale-110' : 'text-slate-400'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const InputField: React.FC<{label: string, value: string, onChange: (v: string) => void, icon: React.ReactNode, placeholder: string, isPassword?: boolean}> = ({ label, value, onChange, icon, placeholder, isPassword }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>
      <input type={isPassword ? "password" : "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 font-black text-sm outline-none focus:border-amber-500 transition-all" />
    </div>
  </div>
);

export default App;
