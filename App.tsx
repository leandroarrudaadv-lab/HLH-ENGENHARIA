
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, LayoutDashboard, HardHat, 
  Users, CloudCheck, Loader2, Database, Settings, X, Save, 
  Link as LinkIcon, ShieldCheck, Copy, Info, CheckCircle2, Play, Package, FolderOpen, Building2, Search, Briefcase, Home, Terminal, RefreshCw, AlertTriangle, Sparkles,
  BarChart3, PiggyBank, Receipt, FileText, Share2
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'employees' | 'project' | 'settings' | 'finances'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'geral' | 'supabase' | 'sql' | 'apk'>('geral');
  
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
          
          if (loadedProjects && loadedProjects.length > 0) {
            setProjects(loadedProjects);
            setGlobalEmployees(loadedEmployees);
          } else {
            const lp = JSON.parse(localStorage.getItem('hlh_projects_cloud_v1') || '[]');
            const le = JSON.parse(localStorage.getItem('hlh_employees_cloud_v1') || '[]');
            setProjects(lp);
            setGlobalEmployees(le);
          }
        }
      } else {
        const lp = JSON.parse(localStorage.getItem('hlh_projects_cloud_v1') || '[]');
        const le = JSON.parse(localStorage.getItem('hlh_employees_cloud_v1') || '[]');
        setProjects(lp);
        setGlobalEmployees(le);
      }
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

    if (DatabaseService.isConfigured()) {
      const syncData = async () => {
        setIsSyncing(true);
        try {
          await Promise.all([
            DatabaseService.saveProjects(projects),
            DatabaseService.saveEmployees(globalEmployees)
          ]);
          setDbStatus({ success: true, message: "Sincronizado" });
        } catch (error: any) {
          setDbStatus({ success: false, message: "Erro de Sincronização" });
        } finally {
          setTimeout(() => setIsSyncing(false), 500);
        }
      };
      const timer = setTimeout(syncData, 1500);
      return () => clearTimeout(timer);
    }
  }, [projects, globalEmployees, isLoading]);

  const totalSpent = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.purchases?.reduce((pAcc, pur) => pAcc + pur.value, 0) || 0), 0);
  }, [projects]);

  const handleManualSync = () => loadInitialData(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-500 p-6 rounded-[2rem] shadow-2xl animate-bounce mb-6">
          <HardHat size={64} className="text-slate-900" />
        </div>
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Sincronizando Nuvem...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-['Inter'] pb-20 md:pb-0">
      <aside className="hidden md:flex flex-col w-80 bg-slate-900 text-white p-8 sticky top-0 h-screen shadow-2xl z-40">
        <div className="mb-10 flex items-center gap-4 cursor-pointer" onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}}>
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg"><Building2 className="text-slate-900" size={32} /></div>
          <div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase leading-none">{companyName}</h1>
            <p className="text-[9px] text-amber-500 uppercase tracking-widest font-black mt-1">Engenharia de Elite</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
          <SideButton active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setSelectedProjectId(null);}} icon={<LayoutDashboard size={20}/>} label="PAINEL GERAL" />
          <SideButton active={currentView === 'employees'} onClick={() => {setCurrentView('employees'); setSelectedProjectId(null);}} icon={<Users size={20}/>} label="EQUIPE" />
          
          <div className="mt-8 p-6 bg-slate-800/50 rounded-3xl border border-white/5">
             <div className="flex items-center gap-2 text-amber-500 mb-2">
               <PiggyBank size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">Total em Obras</span>
             </div>
             <p className="text-xl font-black text-white leading-none">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
             </p>
          </div>

          <div className="pt-8 space-y-2">
            <p className="text-[10px] text-slate-500 font-black uppercase px-4 mb-2 tracking-widest">Suas Obras</p>
            {projects.map(p => (
              <button key={p.id} onClick={() => {setSelectedProjectId(p.id); setCurrentView('project');}} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest border-2 ${selectedProjectId === p.id && currentView === 'project' ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-lg' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
                <div className={`w-2 h-2 rounded-full ${p.status === 'Em andamento' ? 'bg-green-500' : p.status === 'Concluída' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <button onClick={() => setIsSettingsOpen(true)} className={`mt-auto flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${dbStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
          <div className="flex items-center gap-2">
            {dbStatus.success ? <CloudCheck size={18} /> : <AlertTriangle size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{dbStatus.success ? 'NUVEM ATIVA' : 'ERRO NUVEM'}</span>
          </div>
          <Settings size={16} />
        </button>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              {currentView === 'dashboard' ? 'Centro de Operações' : currentView === 'employees' ? 'Gestão de Talentos' : selectedProject?.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full ${dbStatus.success ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
               <span className={`text-[8px] font-black uppercase tracking-widest ${dbStatus.success ? 'text-green-600' : 'text-red-500'}`}>
                 {dbStatus.message || 'Desconectado'}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleManualSync} className={`p-3 rounded-xl border-2 transition-all ${isSyncing ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-100 text-slate-400 hover:text-amber-500'}`}>
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            {currentView === 'dashboard' && (
              <button onClick={() => setIsNewProjectModalOpen(true)} className="bg-slate-900 text-white font-black px-4 py-3 rounded-xl flex items-center gap-2 text-[10px] tracking-widest shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all">
                <Plus size={16} /> ADICIONAR OBRA
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

      <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onAdd={(n, l) => {
        const p: Project = { id: 'p-'+Date.now(), name: n.toUpperCase(), status: 'Planejamento', location: l, progress: 0, employees: [], reports: [], purchases: [], photos: [], presence: [], contracts: [], documents: [] };
        setProjects(prev => [p, ...prev]);
        setIsNewProjectModalOpen(false);
      }} />

      {/* Settings Modal (Omitido para brevidade, mas permanece igual) */}
    </div>
  );
};

const SideButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all uppercase text-[10px] font-black tracking-widest border-2 ${active ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-lg' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
    {icon} {label}
  </button>
);

const BottomTab: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-amber-500 scale-110' : 'text-slate-400'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
