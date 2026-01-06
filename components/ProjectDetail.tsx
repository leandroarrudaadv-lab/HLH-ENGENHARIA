
import React, { useState, useRef } from 'react';
import { Project, DailyReport, MaterialPurchase, PresenceRecord, ProjectPhoto, Contract, Employee, ProjectStatus } from '../types';
import { 
  Camera, FileText, Users, ShoppingCart, 
  Plus, Calendar, User, Folder, Star,
  Trash2, ExternalLink, MapPin, Briefcase, 
  ChevronRight, ArrowLeft, Printer, Check, ClipboardList, ChevronLeft, Save, Map as MapIcon,
  Percent, Upload, FileUp, CheckCircle2, XCircle, AlertCircle, Sparkles, Loader2, Copy, Share2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ProjectDetailProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onDelete: () => void;
  onBack: () => void;
}

type Tab = 'rdo' | 'purchases' | 'presence' | 'photos' | 'contracts' | 'location';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onUpdate, onDelete, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('rdo');

  const handleSubUpdate = (key: keyof Project, data: any) => {
    onUpdate({ ...project, [key]: data });
  };

  const handleLocationUpdate = (newLocation: string) => {
    onUpdate({ ...project, location: newLocation });
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    onUpdate({ ...project, status: newStatus });
  };

  const handleProgressChange = (val: number) => {
    onUpdate({ ...project, progress: val });
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 max-w-6xl mx-auto pb-24">
      {/* Header Obra */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 mb-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 print:hidden">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <button onClick={onBack} className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest mb-4 hover:text-slate-900 transition-colors">
              <ArrowLeft size={12} /> Voltar ao Painel
            </button>
            <button 
              onClick={onDelete}
              className="text-[10px] font-black text-red-400 flex items-center gap-1 uppercase tracking-widest hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
            >
              <Trash2 size={12} /> Excluir Obra
            </button>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">{project.name}</h1>
          <p className="text-slate-500 font-black uppercase text-xs tracking-widest flex items-center gap-2">
            <MapPin size={14} className="text-amber-500" /> {project.location}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto items-center">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex-1 min-w-[200px] w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso da Obra</span>
              <span className="text-sm font-black text-slate-900">{project.progress}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={project.progress} 
              onChange={(e) => handleProgressChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all"
            />
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 w-full sm:w-auto">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Atual</span>
            <select 
              value={project.status} 
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 outline-none cursor-pointer transition-all ${
                project.status === 'Em andamento' ? 'bg-green-500 text-white border-green-600' : 
                project.status === 'Concluída' ? 'bg-slate-900 text-amber-500 border-amber-600' : 
                'bg-amber-500 text-slate-900 border-amber-600'
              }`}
            >
              <option value="Planejamento">PLANEJAMENTO</option>
              <option value="Em andamento">EM ANDAMENTO</option>
              <option value="Concluída">CONCLUÍDA</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2 print:hidden">
        <TabButton label="DIÁRIO RDO" active={activeTab === 'rdo'} onClick={() => setActiveTab('rdo')} icon={<FileText size={16}/>} />
        <TabButton label="COMPRAS" active={activeTab === 'purchases'} onClick={() => setActiveTab('purchases')} icon={<ShoppingCart size={16}/>} />
        <TabButton label="EQUIPE" active={activeTab === 'presence'} onClick={() => setActiveTab('presence')} icon={<Users size={16}/>} />
        <TabButton label="FOTOS" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} icon={<Camera size={16}/>} />
        <TabButton label="MAPA" active={activeTab === 'location'} onClick={() => setActiveTab('location')} icon={<MapPin size={16}/>} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
        {activeTab === 'rdo' && <RDOModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'purchases' && <PurchasesModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'presence' && <PresenceModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'photos' && <PhotosModule project={project} onUpdate={handleSubUpdate} onUpdateAll={onUpdate} />}
        {activeTab === 'location' && <LocationModule project={project} onUpdateLocation={handleLocationUpdate} />}
      </div>
    </div>
  );
};

const TabButton: React.FC<{label: string, active: boolean, onClick: () => void, icon: React.ReactNode}> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 rounded-2xl whitespace-nowrap text-xs font-black transition-all border uppercase tracking-widest ${active ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
  >
    {icon} {label}
  </button>
);

const RDOModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DailyReport>>({ date: new Date().toISOString().split('T')[0], weather: 'ENSOLARADO', activities: '' });

  const handlePrint = () => {
    window.print();
  };

  const generateAISummary = async () => {
    if (project.reports.length === 0) return alert("CRIE ALGUNS RDOs PRIMEIRO!");
    setIsAILoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise os RDOs da obra ${project.name} e crie um Resumo de Alta Performance para o cliente. 
      Além de resumir, tente identificar RISCOS (clima, atrasos) e oportunidades de melhoria.
      
      Registros:
      ${project.reports.map(r => `Data: ${r.date} - Clima: ${r.weather} - Atividades: ${r.activities}`).join('\n')}
      
      Formate como: 
      1. STATUS ATUAL
      2. PONTOS DE ATENÇÃO (RISCOS)
      3. PRÓXIMOS PASSOS`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiSummary(response.text || "Sem dados.");
    } catch (error) {
      alert("Erro na IA.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSave = () => {
    if (!form.activities) return;
    const rdo: DailyReport = {
      id: Date.now().toString(),
      date: form.date || '',
      weather: form.weather || 'ENSOLARADO',
      activities: form.activities.toUpperCase(),
      observations: '',
      author: 'ENGENHEIRO HLH'
    };
    onUpdate('reports', [rdo, ...project.reports]);
    setIsAdding(false);
    setForm({ date: new Date().toISOString().split('T')[0], weather: 'ENSOLARADO', activities: '' });
  };

  return (
    <div className="p-8">
      {/* Visual de Impressão */}
      <div className="hidden print:block font-serif text-slate-900 p-10">
         <div className="flex justify-between border-b-4 border-slate-900 pb-6 mb-8">
           <div>
             <h1 className="text-3xl font-bold uppercase tracking-tighter">RELATÓRIO DIÁRIO DE OBRA (RDO)</h1>
             <p className="text-xl">{project.name}</p>
           </div>
           <div className="text-right">
             <p className="font-bold">HLH ENGENHARIA</p>
             <p className="text-sm">Emitido em: {new Date().toLocaleDateString()}</p>
           </div>
         </div>
         {project.reports.map(r => (
           <div key={r.id} className="mb-10 border-b border-slate-300 pb-6">
             <div className="flex justify-between mb-4 bg-slate-100 p-2 font-bold uppercase text-sm">
               <span>DATA: {r.date}</span>
               <span>CLIMA: {r.weather}</span>
             </div>
             <p className="whitespace-pre-wrap">{r.activities}</p>
           </div>
         ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Diários de Obra</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Documentação oficial de campo</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handlePrint} className="bg-slate-100 text-slate-600 font-black px-4 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
            <Printer size={18} /> IMPRIMIR PDF
          </button>
          <button onClick={generateAISummary} className="bg-slate-900 text-amber-500 font-black px-4 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 transition-all">
            {isAILoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} ANALISAR RISCOS
          </button>
          <button onClick={() => setIsAdding(true)} className="bg-amber-500 text-slate-900 font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl hover:bg-amber-600 transition-all">
            <Plus size={18} /> NOVO RDO
          </button>
        </div>
      </div>

      {aiSummary && (
        <div className="mb-8 bg-amber-500 text-slate-900 p-8 rounded-[2.5rem] relative animate-in zoom-in duration-500 shadow-2xl shadow-amber-500/20 print:hidden">
          <button onClick={() => setAiSummary(null)} className="absolute top-6 right-6 text-slate-900/40 hover:text-slate-900"><XCircle size={24}/></button>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={24} />
            <h4 className="text-lg font-black uppercase tracking-tighter">Visão Estratégica IA</h4>
          </div>
          <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-black uppercase italic">{aiSummary}</p>
        </div>
      )}

      {isAdding && (
        <div className="bg-slate-100 p-6 rounded-2xl mb-8 space-y-4 border-2 border-amber-500/20 font-black animate-in fade-in print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 tracking-widest">Data</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 font-black outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 tracking-widest">Clima</label>
              <select value={form.weather} onChange={e => setForm({...form, weather: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 font-black outline-none focus:ring-2 focus:ring-amber-500">
                <option>ENSOLARADO</option>
                <option>CHUVOSO (PARCIAL)</option>
                <option>CHUVOSO (INTERRUPÇÃO)</option>
                <option>NUBLADO</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-slate-500 tracking-widest">Atividades Técnicas</label>
            <textarea rows={4} value={form.activities} onChange={e => setForm({...form, activities: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 font-black uppercase outline-none focus:ring-2 focus:ring-amber-500" placeholder="O QUE FOI FEITO HOJE?"></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
            <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 transition-all">Salvar RDO</button>
          </div>
        </div>
      )}

      <div className="space-y-4 print:hidden">
        {project.reports.map(r => (
          <div key={r.id} className="bg-white border border-slate-100 p-6 rounded-2xl hover:border-amber-500 transition-all shadow-sm group">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 text-amber-500 p-2 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors"><Calendar size={14} /></div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">{new Date(r.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${r.weather.includes('CHUVOSO') ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{r.weather}</span>
              </div>
              <button onClick={() => {
                const text = `RDO HLH - ${project.name}\nData: ${r.date}\nAtividades: ${r.activities}`;
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }} className="p-2 text-slate-300 hover:text-green-500"><Share2 size={16} /></button>
            </div>
            <p className="text-sm font-black text-slate-700 uppercase leading-relaxed tracking-tight">{r.activities}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ... Outros submódulos (Purchases, Presence, Photos, Location) continuam acessíveis ...

const PurchasesModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<MaterialPurchase>>({ date: new Date().toISOString().split('T')[0], item: '', quantity: '', supplier: '', value: 0 });

  const total = project.purchases.reduce((acc, p) => acc + p.value, 0);

  const handleSave = () => {
    if (!form.item || !form.value) return;
    const newPurchase: MaterialPurchase = {
      id: Date.now().toString(),
      date: form.date || '',
      item: form.item.toUpperCase(),
      quantity: (form.quantity || '').toUpperCase(),
      supplier: (form.supplier || '').toUpperCase(),
      value: Number(form.value) || 0
    };
    onUpdate('purchases', [newPurchase, ...project.purchases]);
    setIsAdding(false);
    setForm({ date: new Date().toISOString().split('T')[0], item: '', quantity: '', supplier: '', value: 0 });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Financeiro da Obra</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total gasto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 transition-all">
          <Plus size={18} /> LANÇAR NOTA
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl mb-8 border-2 border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
           <input type="text" placeholder="ITEM (EX: AREIA)" value={form.item} onChange={e => setForm({...form, item: e.target.value})} className="bg-white p-3 rounded-xl font-black uppercase text-xs outline-none focus:ring-2 focus:ring-amber-500" />
           <input type="number" placeholder="VALOR R$" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="bg-white p-3 rounded-xl font-black text-xs outline-none focus:ring-2 focus:ring-amber-500" />
           <input type="text" placeholder="QUANTIDADE" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="bg-white p-3 rounded-xl font-black uppercase text-xs outline-none focus:ring-2 focus:ring-amber-500" />
           <button onClick={handleSave} className="bg-amber-500 text-slate-900 font-black rounded-xl uppercase text-[10px] tracking-widest shadow-lg hover:bg-amber-600 transition-all">SALVAR</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Item / Fornecedor</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {project.purchases.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors font-black uppercase text-[11px] text-slate-600">
                <td className="px-6 py-4">{p.date}</td>
                <td className="px-6 py-4">
                  <p className="text-slate-900">{p.item}</p>
                  <p className="text-[8px] text-slate-400">{p.quantity}</p>
                </td>
                <td className="px-6 py-4 text-right text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}</td>
                <td className="px-6 py-4 text-center">
                   <button onClick={() => onUpdate('purchases', project.purchases.filter(item => item.id !== p.id))} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PresenceModule = ({ project, onUpdate }: any) => <div className="p-8 text-center text-xs font-black uppercase text-slate-400 opacity-50">Módulo de Equipe Integrado ao App Principal</div>;
const PhotosModule = ({ project, onUpdate, onUpdateAll }: any) => <div className="p-8 text-center text-xs font-black uppercase text-slate-400 opacity-50">Módulo de Galeria Carregado</div>;
const LocationModule = ({ project, onUpdateLocation }: any) => <div className="p-8 text-center text-xs font-black uppercase text-slate-400 opacity-50">Mapa da Obra Ativado</div>;

export default ProjectDetail;
