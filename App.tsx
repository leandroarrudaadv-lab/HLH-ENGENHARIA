
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

  const filteredSidebarProjects = useMemo(() => {
    return projects.filter(p => p.name.toLowerCase().includes(sidebarSearch.toLowerCase()));
  }, [projects, sidebarSearch]);

  const loadInitialData = useCallback(async (forceCloud = false) => {
    setIsLoading(true);
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
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Fallback para local se não houver nuvem ou se a nuvem estiver vazia
      const lp = localStorage.getItem('hlh_projects_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_projects_cloud_v1')!) : [];
      const le = localStorage.getItem('hlh_employees_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_employees_cloud_v1')!) : [];
      setProjects(lp);
      setGlobalEmployees(le);
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
    if (isLoading) return;
    
    // Salva local sempre
    localStorage.setItem('hlh_projects_cloud_v1', JSON.stringify(projects));
    localStorage.setItem('hlh_employees_cloud_v1', JSON.stringify(globalEmployees));

    // Se estiver conectado, tenta sincronizar com a nuvem após 2 segundos de inatividade
    if (DatabaseService.isConfigured() && dbStatus.success) {
      const syncData = async () => {
        setIsSyncing(true);
        try {
          await Promise.all([
            DatabaseService.saveProjects(projects),
            DatabaseService.saveEmployees(globalEmployees)
          ]);
        } catch (error: any) {
          console.error("Erro na sincronização:", error);
        } finally {
          setTimeout(() => setIsSyncing(false), 800);
        }
      };
      const timer = setTimeout(syncData, 2000);
      return () => clearTimeout(timer);
    }
  }, [projects, globalEmployees, isLoading, dbStatus.success]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadInitialData(true);
    setIsSyncing(false);
  };

  const handleSaveConfig = async () => {
    DatabaseService.saveConfig(dbUrl, dbKey);
    const test = await DatabaseService.testConnection();
    setDbStatus(test);
    if (test.success) {
      setSettingsTab('geral');
      loadInitialData(true);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
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
    setProjects(prev => [newProj, ...prev]);
    setIsNewProjectModalOpen(false);
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="bg-amber-500 p-6 rounded-[2rem] shadow-2xl animate-bounce">
          <HardHat size={64} className="text-slate-900" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{companyName}</h2>
        <div className="flex items-center gap-3 text-amber-500/50 font-black text-xs uppercase tracking-widest">
          <Loader2 size={16} className="animate-spin" /> Conectando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-['Inter'] pb-20 md:pb-0">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-80 bg-slate-900 text-white p-8 sticky top-0 h-screen shadow-2xl z-40 overflow-hidden">
        <div className="mb-10 flex items-center gap-4 cursor-pointer" onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}}>
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <Building2 className="text-slate-900" size={32} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tighter leading-none italic truncate uppercase">{companyName}</h1>
            <p className="text-[9px] text-amber-500 uppercase tracking-[0.25em] font-black mt-1">Gestão de Obras</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 flex flex-col min-h-0">
          <SideButton active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} icon={<LayoutDashboard size={20}/>} label="PAINEL GERAL" />
          <SideButton active={currentView === 'employees'} onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} icon={<Users size={20}/>} label="COLABORADORES" />
          
          <div className="pt-8 flex-1 flex flex-col min-h-0">
            <p className="text-[10px] text-slate-500 font-black uppercase px-4 mb-4 tracking-widest">Filtrar Obras</p>
            <div className="px-4 mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  value={sidebarSearch}
                  onChange={e => setSidebarSearch(e.target.value)}
                  placeholder="BUSCAR..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-[10px] font-black uppercase outline-none focus:border-amber-500 transition-all placeholder:text-slate-700"
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
               <span className="text-[10px] font-black uppercase tracking-widest">{dbStatus.success ? 'NUVEM ATIVA' : 'CONFIGURAR'}</span>
             </div>
             <Settings size={16} />
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="md:hidden bg-slate-900 p-2 rounded-xl">
               <Building2 size={20} className="text-amber-500" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tighter italic truncate max-w-[150px] md:max-w-none leading-none">
                {currentView === 'dashboard' ? 'Todas as Obras' : 
                 currentView === 'employees' ? 'Equipe' : 
                 selectedProject?.name}
              </h2>
              {dbStatus.success ? (
                <span className="text-[8px] font-black text-green-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Sincronizado com Nuvem
                </span>
              ) : (
                <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                   <AlertTriangle size={8} /> Modo Local (Offline)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleManualSync}
              className={`p-3 rounded-xl border-2 transition-all ${isSyncing ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white border-slate-100 text-slate-400 hover:text-amber-500 shadow-sm'}`}
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            {currentView === 'dashboard' && (
              <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-slate-900 text-white font-black px-4 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg text-[10px] tracking-widest"
              >
                <Plus size={16} /> <span className="hidden sm:inline">ADICIONAR</span>
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

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] safe-pb">
        <BottomTab active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} icon={<Home size={22}/>} label="Home" />
        <BottomTab active={currentView === 'project'} onClick={() => {if (projects.length > 0) { setSelectedProjectId(projects[0].id); setCurrentView('project'); } else { setCurrentView('dashboard'); }}} icon={<Briefcase size={22}/>} label="Obras" />
        <BottomTab active={currentView === 'employees'} onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} icon={<Users size={22}/>} label="Equipe" />
        <BottomTab active={isSettingsOpen} onClick={() => setIsSettingsOpen(true)} icon={<Settings size={22}/>} label="Ajustes" />
      </nav>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
             <div className="bg-slate-900 p-6 md:p-8 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-3 rounded-2xl text-slate-900"><Settings size={24} /></div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Configurações</h2>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
             </div>

             <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
               <button onClick={() => setSettingsTab('geral')} className={`flex-1 py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${settingsTab === 'geral' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/20' : 'text-slate-400'}`}>GERAL</button>
               <button onClick={() => setSettingsTab('supabase')} className={`flex-1 py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${settingsTab === 'supabase' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/20' : 'text-slate-400'}`}>CONEXÃO</button>
               <button onClick={() => setSettingsTab('sql')} className={`flex-1 py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${settingsTab === 'sql' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/20' : 'text-slate-400'}`}>SQL SETUP</button>
               <button onClick={() => setSettingsTab('apk')} className={`flex-1 py-4 px-4 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${settingsTab === 'apk' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/20' : 'text-slate-400'}`}>GERAR APK</button>
             </div>
             
             <div className="p-6 md:p-8 overflow-y-auto no-scrollbar space-y-6">
                {settingsTab === 'geral' ? (
                  <div className="space-y-6">
                    <InputField label="Nome da Empresa" value={companyName} onChange={v => setCompanyName(v.toUpperCase())} icon={<Building2 size={20}/>} placeholder="HLH ENGENHARIA" />
                  </div>
                ) : settingsTab === 'supabase' ? (
                  <div className="space-y-6">
                    <InputField label="Supabase URL" value={dbUrl} onChange={setDbUrl} icon={<LinkIcon size={20}/>} placeholder="https://..." />
                    <InputField label="Supabase Anon Key" value={dbKey} onChange={setDbKey} icon={<ShieldCheck size={20}/>} placeholder="Sua chave..." isPassword />
                    <button onClick={handleSaveConfig} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-xl"><Save size={20} className="text-amber-500"/> SALVAR E CONECTAR</button>
                    {dbStatus.message && (
                      <div className={`p-4 rounded-2xl text-[10px] font-black uppercase text-center border-2 ${dbStatus.success ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                        {dbStatus.message}
                      </div>
                    )}
                  </div>
                ) : settingsTab === 'sql' ? (
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-200">
                      <p className="text-[11px] text-amber-800 leading-relaxed mb-6 font-medium">Copie e rode este SQL no seu painel do Supabase para criar as tabelas:</p>
                      <pre className="bg-slate-900 text-amber-400 p-5 rounded-2xl text-[9px] font-mono overflow-x-auto max-h-[150px] border-2 border-slate-800 mb-4">
                        {`create table if not exists projects (id text primary key, name text, status text, location text, progress int, mainPhoto text, employees jsonb default '[]', reports jsonb default '[]', purchases jsonb default '[]', photos jsonb default '[]', presence jsonb default '[]', contracts jsonb default '[]', documents jsonb default '[]', created_at timestamp with time zone default now()); \n\n create table if not exists employees (id text primary key, name text, role text, active boolean default true, dailyRate numeric, projectId text, created_at timestamp with time zone default now()); \n\n alter table projects disable row level security; alter table employees disable row level security;`}
                      </pre>
                      <button onClick={() => copyText(`create table if not exists projects (id text primary key, name text, status text, location text, progress int, mainPhoto text, employees jsonb default '[]', reports jsonb default '[]', purchases jsonb default '[]', photos jsonb default '[]', presence jsonb default '[]', contracts jsonb default '[]', documents jsonb default '[]', created_at timestamp with time zone default now()); create table if not exists employees (id text primary key, name text, role text, active boolean default true, dailyRate numeric, projectId text, created_at timestamp with time zone default now()); alter table projects disable row level security; alter table employees disable row level security;`)} className="w-full bg-slate-900 text-amber-500 font-black py-4 rounded-xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg"><Copy size={16} /> COPIAR SQL</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 pb-10">
                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white border-2 border-amber-500/30">
                      <h4 className="text-lg font-black uppercase tracking-tighter italic mb-4">Para atualizar o APK no celular:</h4>
                      <div className="space-y-4">
                        <AndroidStep number="1" text="No Computador: Rode 'npm run build' e 'npx cap sync'." />
                        <AndroidStep number="2" text="No Android Studio: Clique em Build > Build APK(s)." />
                        <AndroidStep number="3" text="O APK gerado na pasta será a versão atualizada. Instale-o no celular." />
                        <AndroidStep number="4" text="Dica: Desinstale a versão antiga do celular para garantir a atualização." />
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

const AndroidStep: React.FC<{number: string, text: string}> = ({ number, text }) => (
  <div className="flex gap-4 items-start">
    <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{number}</div>
    <p className="text-[11px] font-medium leading-relaxed text-slate-300">{text}</p>
  </div>
);

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

export default App;
