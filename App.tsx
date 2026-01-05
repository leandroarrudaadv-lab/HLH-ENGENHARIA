
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, LayoutDashboard, HardHat, 
  Bell, Users, Cloud, CloudCheck, Loader2, RefreshCw, Database, Settings, X, Save, 
  Link as LinkIcon, AlertCircle, ShieldCheck, Copy, Info, CheckCircle2, Terminal, Smartphone, ChevronRight
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

-- Habilitar acesso público (apenas para teste inicial)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON projects FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON employees FOR ALL USING (true) WITH CHECK (true);
`;

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalEmployees, setGlobalEmployees] = useState<Employee[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'employees' | 'project'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'supabase' | 'apk'>('supabase');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');
  const [dbStatus, setDbStatus] = useState<{success?: boolean, message?: string, code?: string}>({});

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setSyncError(null);
    try {
      if (DatabaseService.isConfigured()) {
        const test = await DatabaseService.testConnection();
        setDbStatus(test);
        if (!test.success) {
          setSyncError(test.message);
          const [lp, le] = await Promise.all([
            localStorage.getItem('hlh_projects_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_projects_cloud_v1')!) : [],
            localStorage.getItem('hlh_employees_cloud_v1') ? JSON.parse(localStorage.getItem('hlh_employees_cloud_v1')!) : []
          ]);
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
      setSyncError(error.message || "Erro de conexão");
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
        setSyncError(null);
      } catch (error: any) {
        setSyncError(error.message);
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
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="bg-amber-500 p-6 rounded-[2rem] shadow-2xl animate-bounce">
          <HardHat size={64} className="text-slate-900" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">HLH ENGENHARIA</h2>
          <div className="flex items-center justify-center gap-3 text-amber-500/50 font-black text-xs uppercase tracking-[0.3em]">
            <Loader2 size={16} className="animate-spin" /> Sincronizando Projetos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-['Inter']">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-white p-8 sticky top-0 h-screen shadow-2xl z-40">
        <div className="mb-12 flex items-center gap-4 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <HardHat className="text-slate-900" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none italic">HLH</h1>
            <p className="text-[10px] text-amber-500 uppercase tracking-[0.25em] font-black opacity-80">Engenharia</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <SideButton 
            active={currentView === 'dashboard'} 
            onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} 
            icon={<LayoutDashboard size={20}/>} 
            label="PAINEL GERAL" 
          />
          <SideButton 
            active={currentView === 'employees'} 
            onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} 
            icon={<Users size={20}/>} 
            label="COLABORADORES" 
          />
          
          <div className="pt-10">
            <p className="text-[10px] text-slate-500 font-black uppercase px-4 mb-6 tracking-[0.3em]">Obras em Andamento</p>
            <div className="space-y-2 overflow-y-auto max-h-[30vh] no-scrollbar pr-2">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {setSelectedProjectId(p.id); setCurrentView('project');}}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest border-2 ${selectedProjectId === p.id && currentView === 'project' ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-xl shadow-amber-500/10' : 'hover:bg-slate-800/50 text-slate-400 border-transparent'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800 space-y-4">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${dbStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-amber-500 text-slate-900 border-amber-400 animate-pulse shadow-lg shadow-amber-500/20'}`}
           >
             <div className="flex items-center gap-3">
               {dbStatus.success ? <CloudCheck size={20} /> : <Database size={20} />}
               <span className="text-[10px] font-black uppercase tracking-widest">{dbStatus.success ? 'Nuvem Ativa' : 'CONECTAR BANCO'}</span>
             </div>
             <Settings size={16} className={!dbStatus.success ? 'animate-spin-slow' : ''} />
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="md:hidden bg-amber-500 p-2 rounded-xl" onClick={() => setCurrentView('dashboard')}>
               <HardHat size={24} className="text-slate-900" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
              {currentView === 'dashboard' ? 'Centro de Operações' : 
               currentView === 'employees' ? 'Gestão de Colaboradores' : 
               selectedProject?.name}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {isSyncing && <div className="flex items-center gap-2 text-amber-500 animate-pulse"><Loader2 size={16} className="animate-spin" /><span className="text-[10px] font-black uppercase tracking-widest">Salvando...</span></div>}
            
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setIsSettingsOpen(true)}
                 className={`p-3 rounded-xl flex items-center gap-2 transition-all md:hidden ${dbStatus.success ? 'bg-slate-100 text-slate-500' : 'bg-amber-500 text-slate-900 animate-bounce shadow-lg shadow-amber-500/20'}`}
                 title="Configurações Supabase"
               >
                 <Settings size={20} />
                 {!dbStatus.success && <span className="text-[10px] font-black uppercase tracking-widest pr-2">CONECTAR</span>}
               </button>
               
               {currentView === 'dashboard' && (
                 <button 
                   onClick={() => setIsNewProjectModalOpen(true)}
                   className="bg-slate-900 text-white font-black px-6 md:px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200 uppercase text-xs tracking-widest hover:bg-slate-800"
                 >
                   <Plus size={20} /> <span className="hidden sm:inline">LANÇAR NOVA OBRA</span><span className="sm:hidden">NOVA OBRA</span>
                 </button>
               )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {dbStatus.code === 'MISSING_TABLES' && (
            <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-top duration-500">
               <div className="bg-amber-500 p-6 rounded-[2rem] text-slate-900"><Terminal size={48} /></div>
               <div className="flex-1 space-y-2">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Quase lá! Faltam as tabelas no Supabase</h3>
                 <p className="text-slate-600 text-sm font-medium">Conectamos na sua URL, mas seu banco de dados está vazio. Clique no botão ao lado para copiar o script de criação e cole no <b>SQL Editor</b> do seu painel Supabase.</p>
               </div>
               <button onClick={() => copyText(SQL_INSTRUCTIONS)} className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl active:scale-95 transition-all">
                 <Copy size={20} /> COPIAR SCRIPT SQL
               </button>
            </div>
          )}

          {currentView === 'project' && selectedProject ? (
            <ProjectDetail project={selectedProject} onUpdate={updateProject} onDelete={() => deleteProject(selectedProject.id)} onBack={() => setCurrentView('dashboard')} />
          ) : currentView === 'employees' ? (
            <EmployeeManagement employees={globalEmployees} setEmployees={setGlobalEmployees} projects={projects} onUpdateProjects={setProjects} />
          ) : (
            <Dashboard projects={projects} onSelect={(id) => {setSelectedProjectId(id); setCurrentView('project');}} onDeleteProject={deleteProject} />
          )}
        </div>
      </main>

      {/* MODAL DE CONFIGURAÇÕES MELHORADA COM GUIA APK */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
             <div className="bg-slate-900 p-8 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-3 rounded-2xl text-slate-900"><Settings size={24} /></div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Configurações</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Banco e Exportação Mobile</p>
                  </div>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                  <X size={24} />
                </button>
             </div>

             {/* TABS CONFIGURAÇÕES */}
             <div className="flex border-b border-slate-100 shrink-0">
               <button 
                 onClick={() => setSettingsTab('supabase')}
                 className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === 'supabase' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 <div className="flex items-center justify-center gap-2"><Database size={16}/> Supabase (Nuvem)</div>
               </button>
               <button 
                 onClick={() => setSettingsTab('apk')}
                 className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === 'apk' ? 'text-amber-500 border-b-4 border-amber-500 bg-amber-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 <div className="flex items-center justify-center gap-2"><Smartphone size={16}/> Gerar APK Android</div>
               </button>
             </div>
             
             <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                {settingsTab === 'supabase' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Project URL</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors">
                          <LinkIcon size={20} />
                        </div>
                        <input 
                          type="text"
                          value={dbUrl}
                          onChange={e => setDbUrl(e.target.value)}
                          placeholder="https://xyz.supabase.co"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-6 py-5 font-black text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Anon Key</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors">
                          <ShieldCheck size={20} />
                        </div>
                        <input 
                          type="password"
                          value={dbKey}
                          onChange={e => setDbKey(e.target.value)}
                          placeholder="Public key..."
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-6 py-5 font-black text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {dbStatus.message && (
                      <div className={`p-5 rounded-2xl flex items-center gap-4 border-2 ${dbStatus.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                        {dbStatus.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <p className="text-xs font-black uppercase tracking-tight">{dbStatus.message}</p>
                      </div>
                    )}

                    <button 
                      onClick={handleSaveConfig}
                      className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] active:scale-95 transition-all hover:bg-slate-800"
                    >
                      <Save size={22} className="text-amber-500" /> SALVAR CONFIGURAÇÃO
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Terminal size={18} className="text-amber-500" /> 
                        O que é a "Sincronização"?
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        O Android Studio cria o arquivo instalável (APK), mas ele não "vê" o seu código React automaticamente. Você precisa rodar o comando abaixo para copiar os arquivos atualizados para a pasta do Android sempre que fizer uma alteração.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passo 1: Sincronizar Código Web</p>
                      <div className="bg-slate-900 p-5 rounded-2xl flex items-center justify-between group">
                        <code className="text-amber-500 font-mono text-xs">npx cap copy</code>
                        <button onClick={() => copyText('npx cap copy')} className="text-slate-500 hover:text-white transition-colors">
                          <Copy size={18} />
                        </button>
                      </div>

                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passo 2: Abrir Android Studio</p>
                      <div className="bg-slate-900 p-5 rounded-2xl flex items-center justify-between group">
                        <code className="text-amber-500 font-mono text-xs">npx cap open android</code>
                        <button onClick={() => copyText('npx cap open android')} className="text-slate-500 hover:text-white transition-colors">
                          <Copy size={18} />
                        </button>
                      </div>

                      <div className="bg-amber-100 p-6 rounded-3xl border-2 border-amber-200 flex items-start gap-4">
                        <Info size={24} className="text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-amber-900 uppercase mb-1">DICA PARA O APK FINAL</p>
                          <p className="text-[11px] text-amber-800 font-medium leading-tight">
                            Dentro do Android Studio, vá em <b>Build > Build Bundle(s) / APK(s) > Build APK(s)</b>. Aguarde alguns segundos e clique em "Locate" para pegar o arquivo pronto!
                          </p>
                        </div>
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
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all uppercase text-[11px] font-black tracking-[0.15em] border-2 ${active ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-xl shadow-amber-500/20' : 'hover:bg-slate-800 text-slate-400 border-transparent'}`}
  >
    {icon} {label}
  </button>
);

export default App;
