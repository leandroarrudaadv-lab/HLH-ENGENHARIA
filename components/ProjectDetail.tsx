
import React, { useState } from 'react';
import { Project, DailyReport, MaterialPurchase, PresenceRecord, ProjectPhoto, Contract, Employee } from '../types';
import { 
  Camera, FileText, Users, ShoppingCart, 
  Plus, Calendar, Sun, Cloud, Info, User, 
  Trash2, ExternalLink, Sparkles, MapPin, Search,
  Briefcase, Folder, FileCheck, ChevronRight,
  ArrowLeft, HardHat, UserPlus, Printer, Check, X as XIcon, ClipboardList
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ProjectDetailProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onBack: () => void;
}

type Tab = 'photos' | 'rdo' | 'presence' | 'purchases' | 'documents' | 'location' | 'contracts';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('rdo');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const updateTabContent = (key: keyof Project, data: any) => {
    onUpdate({ ...project, [key]: data });
  };

  const generateAISummary = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Como engenheiro sênior da HLH Engenharia, resuma o andamento da obra ${project.name}. 
      Aqui estão os dados recentes:
      - RDOs recentes: ${JSON.stringify(project.reports.slice(-3))}
      - Compras recentes: ${JSON.stringify(project.purchases.slice(-3))}
      - Progresso atual: ${project.progress}%
      Gere um resumo executivo de 3 parágrafos focando em produtividade, riscos e próximos passos. Use um tom profissional.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiSummary(response.text || 'Não foi possível gerar o resumo no momento.');
    } catch (err) {
      console.error(err);
      setAiSummary('Erro ao conectar com a inteligência artificial.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.name}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Localização: {project.location}
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={generateAISummary}
              disabled={isAiLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
            >
              <Sparkles size={18} />
              {isAiLoading ? 'Analisando...' : 'Resumo IA'}
            </button>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-black">Status Geral</span>
              <select 
                value={project.status}
                onChange={(e) => onUpdate({...project, status: e.target.value as any})}
                className="bg-slate-100 text-lg font-bold text-slate-900 border-none rounded-xl px-3 py-1 focus:ring-2 focus:ring-amber-500 cursor-pointer outline-none"
              >
                <option value="Em andamento">Em andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Planejamento">Planejamento</option>
              </select>
            </div>
          </div>
        </div>

        {aiSummary && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setAiSummary(null)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">
              <Trash2 size={16} />
            </button>
            <h4 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              Relatório de Inteligência HLH
            </h4>
            <div className="text-indigo-800 text-sm whitespace-pre-line leading-relaxed font-bold">
              {aiSummary}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Control */}
      <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-2">
        <TabButton icon={<FileText size={18}/>} label="RDO (Diário)" active={activeTab === 'rdo'} onClick={() => setActiveTab('rdo')} />
        <TabButton icon={<Camera size={18}/>} label="Fotos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />
        <TabButton icon={<Users size={18}/>} label="Presença" active={activeTab === 'presence'} onClick={() => setActiveTab('presence')} />
        <TabButton icon={<ShoppingCart size={18}/>} label="Compras" active={activeTab === 'purchases'} onClick={() => setActiveTab('purchases')} />
        <TabButton icon={<MapPin size={18}/>} label="Mapa" active={activeTab === 'location'} onClick={() => setActiveTab('location')} />
        <TabButton icon={<Briefcase size={18}/>} label="Contratos" active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} />
        <TabButton icon={<ExternalLink size={18}/>} label="Projetos" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'rdo' && <RDOModule project={project} onUpdate={updateTabContent} />}
        {activeTab === 'photos' && <PhotosModule project={project} onUpdate={updateTabContent} />}
        {activeTab === 'presence' && <PresenceModule project={project} onUpdate={updateTabContent} />}
        {activeTab === 'purchases' && <PurchasesModule project={project} onUpdate={updateTabContent} />}
        {activeTab === 'documents' && <DocumentsModule project={project} onUpdate={updateTabContent} />}
        {activeTab === 'location' && <LocationModule project={project} />}
        {activeTab === 'contracts' && <ContractsModule project={project} onUpdate={updateTabContent} />}
      </div>
    </div>
  );
};

const TabButton: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap text-sm font-bold transition-all border ${active ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
  >
    {icon}
    {label}
  </button>
);

// --- MODULES ---

const PresenceModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [subTab, setSubTab] = useState<'diario' | 'equipe' | 'historico'>('diario');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempPresence, setTempPresence] = useState<Record<string, 'Presente' | 'Faltou' | 'Atestado'>>({});

  const addEmployee = () => {
    if (!employeeName) return;
    const newEmp: Employee = {
      id: Date.now().toString(),
      name: employeeName,
      role: employeeRole || 'Ajudante',
      active: true
    };
    onUpdate('employees', [...(project.employees || []), newEmp]);
    setEmployeeName('');
    setEmployeeRole('');
  };

  const saveDailyPresence = () => {
    const newRecords: PresenceRecord[] = project.employees.map(emp => ({
      id: `${currentDate}-${emp.id}`,
      date: currentDate,
      employeeId: emp.id,
      employeeName: emp.name,
      status: tempPresence[emp.id] || 'Presente'
    }));

    const otherRecords = project.presence.filter(p => p.date !== currentDate);
    onUpdate('presence', [...otherRecords, ...newRecords]);
    alert('Presença salva com sucesso!');
  };

  const generatePDF = () => {
    window.print();
  };

  const historyByDate = project.presence.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, PresenceRecord[]>);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Gestão de Equipe e Frequência</h3>
          <p className="text-sm text-slate-500 font-medium">Controle diário de funcionários HLH</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl font-black">
          <button 
            onClick={() => setSubTab('diario')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${subTab === 'diario' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Chamada Diária
          </button>
          <button 
            onClick={() => setSubTab('equipe')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${subTab === 'equipe' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Cadastrar Equipe
          </button>
          <button 
            onClick={() => setSubTab('historico')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${subTab === 'historico' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Histórico
          </button>
        </div>
      </div>

      {subTab === 'equipe' && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus size={16} /> Cadastrar Novo Funcionário
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end font-black">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Nome Completo</label>
                <input 
                  type="text" 
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl text-sm px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none" 
                  placeholder="Ex: João da Silva" 
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Cargo/Função</label>
                  <input 
                    type="text" 
                    value={employeeRole}
                    onChange={e => setEmployeeRole(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-xl text-sm px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none" 
                    placeholder="Ex: Pedreiro" 
                  />
                </div>
                <button onClick={addEmployee} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all uppercase">
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(project.employees || []).map(emp => (
              <div key={emp.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm group hover:border-amber-500 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold group-hover:bg-amber-100 group-hover:text-amber-600 font-black">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest font-black">{emp.role}</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors p-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'diario' && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Data da Chamada</label>
              <input 
                type="date" 
                value={currentDate} 
                onChange={e => setCurrentDate(e.target.value)}
                className="bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none font-black"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all font-black">
                <Printer size={16} /> Emitir Lista PDF
              </button>
              <button onClick={saveDailyPresence} className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-slate-900 rounded-xl text-xs font-black shadow-lg shadow-amber-200 active:scale-95 transition-all">
                <Check size={16} /> Salvar Chamada
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Funcionário</th>
                  <th className="px-6 py-4 text-center">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(!project.employees || project.employees.length === 0) ? (
                  <tr>
                    <td colSpan={2} className="py-20 text-center text-slate-400 font-medium font-black">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={32} />
                        <p className="font-bold">Nenhum funcionário cadastrado nesta obra.</p>
                        <button onClick={() => setSubTab('equipe')} className="text-amber-600 font-black hover:underline uppercase tracking-widest">Cadastrar Equipe</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  project.employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase font-black">{emp.role}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <PresenceOption 
                            label="Presente" 
                            active={(tempPresence[emp.id] || 'Presente') === 'Presente'} 
                            onClick={() => setTempPresence({...tempPresence, [emp.id]: 'Presente'})}
                            color="bg-green-500"
                          />
                          <PresenceOption 
                            label="Faltou" 
                            active={tempPresence[emp.id] === 'Faltou'} 
                            onClick={() => setTempPresence({...tempPresence, [emp.id]: 'Faltou'})}
                            color="bg-red-500"
                          />
                          <PresenceOption 
                            label="Atestado" 
                            active={tempPresence[emp.id] === 'Atestado'} 
                            onClick={() => setTempPresence({...tempPresence, [emp.id]: 'Atestado'})}
                            color="bg-blue-500"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'historico' && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          {Object.entries(historyByDate).length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-black">Sem histórico de chamadas.</div>
          ) : (
            (Object.entries(historyByDate) as [string, PresenceRecord[]][]).sort((a,b) => b[0].localeCompare(a[0])).map(([date, records]) => (
              <div key={date} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3 font-black">
                    <div className="p-2 bg-slate-900 text-white rounded-lg">
                      <ClipboardList size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{new Date(date + 'T12:00:00Z').toLocaleDateString('pt-BR')}</h4>
                      <p className="text-xs text-slate-400 font-medium font-black uppercase tracking-widest">Resumo: {records.filter(r => r.status === 'Presente').length} presentes de {records.length}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <ExternalLink size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {records.map(r => (
                    <div key={r.id} className="text-[10px] px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                      <span className="truncate max-w-[80px] font-bold text-slate-700 font-black uppercase">{r.employeeName}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Presente' ? 'bg-green-500' : r.status === 'Faltou' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      
      <div id="print-area" className="hidden print:block p-10 bg-white">
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black">HLH ENGENHARIA</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest font-black">Relatório de Presença - {project.name}</p>
          </div>
          <p className="text-lg font-bold">{new Date(currentDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="py-3 font-bold font-black">Funcionário</th>
              <th className="py-3 font-bold font-black">Cargo</th>
              <th className="py-3 font-bold font-black">Status</th>
              <th className="py-3 font-bold font-black">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {project.employees.map(emp => (
              <tr key={emp.id} className="border-b border-slate-100">
                <td className="py-3 font-bold font-black">{emp.name}</td>
                <td className="py-3 font-bold font-black">{emp.role}</td>
                <td className="py-3 font-black text-xs uppercase">{tempPresence[emp.id] || 'Presente'}</td>
                <td className="py-3 w-40 border-b border-dotted border-slate-400"></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-20 flex justify-between">
          <div className="text-center w-64 border-t border-slate-900 pt-2">
            <p className="text-xs font-bold font-black uppercase">Engenheiro Responsável</p>
          </div>
          <div className="text-center w-64 border-t border-slate-900 pt-2">
            <p className="text-xs font-bold font-black uppercase">Mestre de Obras</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PresenceOption: React.FC<{label: string, active: boolean, onClick: () => void, color: string}> = ({ label, active, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 border ${
      active ? `${color} text-white border-transparent shadow-md scale-105` : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 font-black'
    }`}
  >
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : color}`}></div>
    {label}
  </button>
);

const ContractsModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [selectedFolder, setSelectedFolder] = useState<'cliente' | 'empreiteiro' | null>(null);

  const addContract = (type: 'cliente' | 'empreiteiro', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newContract: Contract = {
        id: Date.now().toString(),
        type,
        name: file.name,
        url: '#', 
        date: new Date().toLocaleDateString('pt-BR')
      };
      onUpdate('contracts', [...(project.contracts || []), newContract]);
    }
  };

  const filteredContracts = (project.contracts || []).filter(c => c.type === selectedFolder);

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        {selectedFolder && (
          <button 
            onClick={() => setSelectedFolder(null)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h3 className="text-xl font-bold text-slate-900 font-black uppercase tracking-tight">
          {selectedFolder === 'cliente' ? 'Contratos HLH Cliente' : 
           selectedFolder === 'empreiteiro' ? 'HLH Empreiteiros' : 
           'Gestão de Contratos'}
        </h3>
      </div>

      {!selectedFolder ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FolderCard 
            title="Contrato HLH Cliente" 
            count={(project.contracts || []).filter(c => c.type === 'cliente').length}
            onClick={() => setSelectedFolder('cliente')}
            icon={<User size={32} className="text-amber-500" />}
          />
          <FolderCard 
            title="HLH Empreiteiros" 
            count={(project.contracts || []).filter(c => c.type === 'empreiteiro').length}
            onClick={() => setSelectedFolder('empreiteiro')}
            icon={<HardHat size={32} className="text-slate-500" />}
          />
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="flex justify-end">
            <label className="bg-slate-900 text-white font-black px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform uppercase tracking-widest text-xs">
              <Plus size={18} /> Novo PDF
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={(e) => addContract(selectedFolder, e)} 
              />
            </label>
          </div>

          <div className="space-y-3 font-black">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold uppercase tracking-widest">
                Nenhum contrato PDF inserido nesta pasta.
              </div>
            ) : (
              filteredContracts.map(contract => (
                <div key={contract.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-red-500 group-hover:bg-red-50">
                      <FileCheck size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-tight">{contract.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-black">{contract.date}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <ExternalLink size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FolderCard: React.FC<{title: string, count: number, onClick: () => void, icon: React.ReactNode}> = ({ title, count, onClick, icon }) => (
  <button 
    onClick={onClick}
    className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-start gap-4 hover:shadow-xl hover:border-amber-500 transition-all text-left group"
  >
    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-amber-50 transition-colors">
      {icon}
    </div>
    <div className="flex-1 w-full">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h4>
        <ChevronRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
      </div>
      <p className="text-sm font-medium text-slate-400 font-black uppercase tracking-widest text-[10px]">{count} documentos inseridos</p>
    </div>
  </button>
);

const LocationModule: React.FC<{project: Project}> = ({ project }) => {
  const [nearbySearch, setNearbySearch] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);

  const searchNearby = async () => {
    if (!nearbySearch) return;
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Encontre ${nearbySearch} próximos à obra ${project.name} em ${project.location}. Liste os melhores e forneça links do Google Maps.`,
        config: {
          tools: [{ googleMaps: {} }],
        }
      });
      
      setSearchResult(response.text || null);
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        setGroundingLinks(chunks.filter((c: any) => c.maps).map((c: any) => c.maps));
      }
    } catch (err) {
      console.error(err);
      setSearchResult("Erro ao buscar locais próximos.");
    } finally {
      setIsSearching(false);
    }
  };

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(project.location + ' ' + project.name)}&output=embed`;

  return (
    <div className="p-0 flex flex-col h-full min-h-[600px]">
      <div className="flex-1 min-h-[400px]">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0} 
          src={mapUrl}
          className="border-none grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          title={`Mapa da Obra ${project.name}`}
        />
      </div>
      
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 font-black uppercase">
          <Search size={16} /> Pesquisa de Infraestrutura Próxima (IA)
        </h4>
        <div className="flex gap-2 mb-4 font-black">
          <input 
            type="text" 
            placeholder="Ex: Lojas de material de construção, depósitos..."
            value={nearbySearch}
            onChange={(e) => setNearbySearch(e.target.value)}
            className="flex-1 bg-slate-100 border-none rounded-xl text-sm px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-400 font-black"
          />
          <button 
            onClick={searchNearby}
            disabled={isSearching}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm disabled:opacity-50 font-black uppercase tracking-widest"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {searchResult && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap font-bold">
              {searchResult}
            </div>
            {groundingLinks.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                {groundingLinks.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-200 font-black"
                  >
                    <MapPin size={10} /> {link.title || 'Ver no Maps'}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RDOModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newRdo, setNewRdo] = useState<Partial<DailyReport>>({ date: new Date().toISOString().split('T')[0], weather: 'Ensolarado' });

  const handleSave = () => {
    const rdo: DailyReport = {
      id: Date.now().toString(),
      date: newRdo.date || '',
      weather: newRdo.weather || '',
      activities: newRdo.activities || '',
      observations: newRdo.observations || '',
      author: 'Eng. Responsável'
    };
    onUpdate('reports', [rdo, ...project.reports]);
    setIsAdding(false);
    setNewRdo({ date: new Date().toISOString().split('T')[0], weather: 'Ensolarado' });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 uppercase font-black">Relatório Diário de Obra (RDO)</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-amber-500 text-slate-900 font-black px-4 py-2 rounded-lg flex items-center gap-2 font-black uppercase tracking-tight"
        >
          <Plus size={18} /> Novo Registro
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-4 animate-in fade-in slide-in-from-top-4 font-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-widest font-black">Data</label>
              <input 
                type="date" 
                value={newRdo.date} 
                onChange={e => setNewRdo({...newRdo, date: e.target.value})} 
                className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none font-black" 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-widest font-black">Clima</label>
              <select 
                value={newRdo.weather} 
                onChange={e => setNewRdo({...newRdo, weather: e.target.value})} 
                className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer font-black"
              >
                <option>Ensolarado</option>
                <option>Chuvoso</option>
                <option>Nublado</option>
                <option>Parcialmente Nublado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1 tracking-widest font-black">Atividades do Dia</label>
            <textarea 
              rows={3} 
              value={newRdo.activities} 
              onChange={e => setNewRdo({...newRdo, activities: e.target.value})} 
              className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none font-black" 
              placeholder="O que foi feito hoje?"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 font-black">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-bold hover:text-slate-700 font-black uppercase text-xs">Cancelar</button>
            <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold font-black uppercase text-xs tracking-widest">Salvar RDO</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {project.reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl font-bold font-black uppercase tracking-widest">
            Nenhum relatório diário registrado ainda.
          </div>
        ) : (
          project.reports.map(r => (
            <div key={r.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-900">{new Date(r.date).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 flex items-center gap-1 font-bold font-black">
                    {r.weather === 'Ensolarado' ? <Sun size={12}/> : <Cloud size={12}/>}
                    {r.weather}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-black text-slate-300">#{r.id.slice(-4)}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-2 font-bold font-black">{r.activities}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black">
                <User size={12} /> {r.author}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PhotosModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ProjectPhoto = {
          id: Date.now().toString(),
          url: reader.result as string,
          caption: 'Registro de Obra',
          date: new Date().toLocaleDateString('pt-BR')
        };
        onUpdate('photos', [newPhoto, ...project.photos]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 uppercase font-black">Galeria de Evolução</h3>
        <label className="bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-md font-black uppercase text-xs tracking-tight">
          <Camera size={18} /> Tirar Foto / Upload
          <input type="file" accept="image/*" onChange={addPhoto} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {project.photos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl font-bold font-black uppercase tracking-widest">
            Nenhuma foto registrada. Use o botão acima para capturar o progresso.
          </div>
        ) : (
          project.photos.map(p => (
            <div key={p.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
              <img src={p.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-[10px] font-black uppercase tracking-widest">{p.date}</p>
                <p className="text-white/80 text-[8px] truncate font-bold font-black">{p.caption}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PurchasesModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<MaterialPurchase>>({ 
    date: new Date().toISOString().split('T')[0], 
    supplier: '', 
    observation: '',
    item: '',
    quantity: '',
    value: 0
  });

  const handleSave = () => {
    if (!form.item || !form.date) {
      alert("Por favor, preencha pelo menos o item e a data.");
      return;
    }

    const purchase: MaterialPurchase = {
      id: Date.now().toString(),
      date: form.date || new Date().toISOString().split('T')[0],
      item: form.item || '',
      quantity: form.quantity || '',
      supplier: form.supplier || '',
      value: Number(form.value) || 0,
      observation: form.observation || ''
    };
    
    onUpdate('purchases', [purchase, ...project.purchases]);
    setIsAdding(false);
    setForm({ 
      date: new Date().toISOString().split('T')[0], 
      supplier: '', 
      observation: '',
      item: '',
      quantity: '',
      value: 0
    });
  };

  const handleDelete = (id: string) => {
    // Garantindo que a confirmação é explícita e a atualização do estado é clara
    const isConfirmed = window.confirm('Deseja realmente excluir este lançamento de compra permanentemente?');
    if (isConfirmed) {
      const updatedPurchases = project.purchases.filter(p => p.id !== id);
      onUpdate('purchases', updatedPurchases);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 uppercase font-black">Compras de Materiais</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white font-black px-4 py-2 rounded-lg flex items-center gap-2 font-black uppercase tracking-tight"
        >
          <Plus size={18} /> Lançar Compra
        </button>
      </div>

      {isAdding && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 space-y-4 animate-in zoom-in duration-200 font-black">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">Item</label>
              <input 
                type="text" 
                value={form.item} 
                onChange={e => setForm({...form, item: e.target.value})} 
                className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-400 font-black" 
                placeholder="Ex: Cimento" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">Qtd</label>
              <input 
                type="text" 
                value={form.quantity} 
                onChange={e => setForm({...form, quantity: e.target.value})} 
                className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-400 font-black" 
                placeholder="Ex: 50 sacos" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">Valor Total</label>
              <input 
                type="number" 
                value={form.value} 
                onChange={e => setForm({...form, value: Number(e.target.value)})} 
                className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-400 font-black" 
                placeholder="R$ 0,00" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">Fornecedor</label>
              <input 
                type="text" 
                value={form.supplier} 
                onChange={e => setForm({...form, supplier: e.target.value})} 
                className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-400 font-black" 
                placeholder="Ex: Depósito HLH" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">Data da Compra</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={e => setForm({...form, date: e.target.value})} 
                className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none font-black" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">Observação</label>
            <textarea 
              rows={2}
              value={form.observation} 
              onChange={e => setForm({...form, observation: e.target.value})} 
              className="w-full bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-900 px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-400 font-black" 
              placeholder="Notas adicionais sobre a compra..." 
            />
          </div>

          <div className="flex justify-end gap-3 font-black">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-amber-700 font-bold hover:text-amber-900 font-black uppercase text-xs">Cancelar</button>
            <button onClick={handleSave} className="bg-amber-500 text-slate-900 px-6 py-2 rounded-lg font-bold font-black uppercase text-xs tracking-widest">Salvar Compra</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="pb-4 px-2">Data</th>
              <th className="pb-4 px-2">Material / Qtd</th>
              <th className="pb-4 px-2">Fornecedor</th>
              <th className="pb-4 text-right px-2">Valor</th>
              <th className="pb-4 px-2">Observação</th>
              <th className="pb-4 text-center px-2">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-black">
            {project.purchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum lançamento de material registrado.</td>
              </tr>
            ) : (
              project.purchases.map(p => (
                <tr key={p.id} className="text-sm group hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-2 font-bold text-slate-500 whitespace-nowrap">
                    {p.date ? new Date(p.date + 'T12:00:00Z').toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="py-4 px-2">
                    <p className="font-black text-slate-900 uppercase tracking-tight">{p.item}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{p.quantity}</p>
                  </td>
                  <td className="py-4 px-2 text-slate-700 uppercase">{p.supplier || '-'}</td>
                  <td className="py-4 px-2 text-right font-black text-slate-900 whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
                  </td>
                  <td className="py-4 px-2 text-slate-500 text-xs italic max-w-[150px] truncate font-bold">{p.observation || '-'}</td>
                  <td className="py-4 px-2 text-center">
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 active:scale-90"
                      title="Excluir lançamento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DocumentsModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  return (
    <div className="p-6 font-black">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 uppercase">Projetos e Plantas</h3>
        <button className="bg-slate-200 text-slate-600 font-black px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed uppercase text-xs">
          <Plus size={18} /> Upload Doc
        </button>
      </div>

      <div className="space-y-3 font-black">
        {['Planta Baixa - Arquitetônico.pdf', 'Projeto Estrutural - Rev 03.pdf', 'Projeto Hidrossanitário.dwg', 'Memorial Descritivo.docx'].map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 group-hover:text-amber-500 transition-colors">
                <FileText size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{doc}</span>
            </div>
            <ExternalLink size={16} className="text-slate-300 group-hover:text-slate-600" />
          </div>
        ))}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
          <Info className="text-blue-500 shrink-0" size={18} />
          <p className="text-xs text-blue-700 leading-relaxed font-bold font-black uppercase tracking-tight">
            Os arquivos de projeto são sincronizados automaticamente com o servidor central da HLH Engenharia. 
            Modificações feitas no canteiro devem ser reportadas via RDO.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
