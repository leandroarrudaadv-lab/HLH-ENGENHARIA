
import React, { useState } from 'react';
import { Project, DailyReport, MaterialPurchase, PresenceRecord, ProjectPhoto, Contract, Employee } from '../types';
import { 
  Camera, FileText, Users, ShoppingCart, 
  Plus, Calendar, User, 
  Trash2, ExternalLink, MapPin, Briefcase, 
  ChevronRight, ArrowLeft, Printer, Check, ClipboardList
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onBack: () => void;
}

type Tab = 'rdo' | 'purchases' | 'presence' | 'photos' | 'contracts' | 'location';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('rdo');

  const handleSubUpdate = (key: keyof Project, data: any) => {
    onUpdate({ ...project, [key]: data });
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 max-w-6xl mx-auto">
      {/* Header Obra */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button onClick={onBack} className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest mb-4 hover:text-slate-900 transition-colors">
            <ArrowLeft size={12} /> Voltar ao Painel
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{project.name}</h1>
          <p className="text-slate-500 font-black uppercase text-xs tracking-widest mt-1 flex items-center gap-2">
            <MapPin size={14} className="text-amber-500" /> {project.location}
          </p>
        </div>
        <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-right">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Atual</span>
          <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">{project.status}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
        <TabButton label="DIÁRIO RDO" active={activeTab === 'rdo'} onClick={() => setActiveTab('rdo')} icon={<FileText size={16}/>} />
        <TabButton label="COMPRAS" active={activeTab === 'purchases'} onClick={() => setActiveTab('purchases')} icon={<ShoppingCart size={16}/>} />
        <TabButton label="PRESENÇA" active={activeTab === 'presence'} onClick={() => setActiveTab('presence')} icon={<Users size={16}/>} />
        <TabButton label="FOTOS" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} icon={<Camera size={16}/>} />
        <TabButton label="CONTRATOS" active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} icon={<Briefcase size={16}/>} />
        <TabButton label="MAPA" active={activeTab === 'location'} onClick={() => setActiveTab('location')} icon={<MapPin size={16}/>} />
      </div>

      {/* Module Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
        {activeTab === 'rdo' && <RDOModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'purchases' && <PurchasesModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'presence' && <PresenceModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'photos' && <PhotosModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'contracts' && <ContractsModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'location' && <LocationModule project={project} />}
      </div>
    </div>
  );
};

const TabButton: React.FC<{label: string, active: boolean, onClick: () => void, icon: React.ReactNode}> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 rounded-2xl whitespace-nowrap text-xs font-black transition-all border uppercase tracking-widest ${active ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
  >
    {icon} {label}
  </button>
);

// --- COMPONENTES DE MÓDULO ---

const PurchasesModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<MaterialPurchase>>({ 
    date: new Date().toISOString().split('T')[0], 
    item: '', 
    quantity: '', 
    supplier: '', 
    value: 0 
  });

  const handleSave = () => {
    if (!form.item || !form.value) return;
    const newPurchase: MaterialPurchase = {
      id: Date.now().toString(),
      date: form.date || '',
      item: form.item.toUpperCase(),
      quantity: (form.quantity || '').toUpperCase(),
      supplier: (form.supplier || '').toUpperCase(),
      value: Number(form.value) || 0,
      observation: (form.observation || '').toUpperCase()
    };
    onUpdate('purchases', [newPurchase, ...project.purchases]);
    setIsAdding(false);
    setForm({ date: new Date().toISOString().split('T')[0], item: '', quantity: '', supplier: '', value: 0 });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('EXCLUIR ESTE LANÇAMENTO PERMANENTEMENTE?')) {
      const filtered = project.purchases.filter(p => p.id !== id);
      onUpdate('purchases', filtered);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gestão de Compras</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl active:scale-95"
        >
          <Plus size={18} /> LANÇAR COMPRA
        </button>
      </div>

      {isAdding && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 space-y-4 animate-in zoom-in duration-200 font-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-amber-700 tracking-widest">Material</label>
              <input type="text" value={form.item} onChange={e => setForm({...form, item: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-black uppercase outline-none focus:ring-2 focus:ring-amber-500" placeholder="EX: CIMENTO" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-amber-700 tracking-widest">Qtd</label>
              <input type="text" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-black uppercase outline-none focus:ring-2 focus:ring-amber-500" placeholder="EX: 100 SACOS" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-amber-700 tracking-widest">Valor R$</label>
              <input type="number" value={form.value} onChange={e => setForm({...form, value: Number(e.target.value)})} className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-amber-800 uppercase text-[10px] tracking-widest">Cancelar</button>
            <button onClick={handleSave} className="bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">SALVAR LANÇAMENTO</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Item / Fornecedor</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-black">
            {project.purchases.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-slate-300 uppercase tracking-widest text-xs">Nenhum lançamento efetuado.</td></tr>
            ) : (
              project.purchases.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-[10px] text-slate-500">{new Date(p.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 uppercase tracking-tight">{p.item}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{p.quantity} | {p.supplier || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-3 text-slate-300 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      title="Excluir Lançamento"
                    >
                      <Trash2 size={18} />
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

const RDOModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<DailyReport>>({ date: new Date().toISOString().split('T')[0], weather: 'ENSOLARADO', activities: '' });

  const handleSave = () => {
    if (!form.activities) return;
    const rdo: DailyReport = {
      id: Date.now().toString(),
      date: form.date || '',
      weather: form.weather || 'ENSOLARADO',
      activities: form.activities.toUpperCase(),
      observations: '',
      author: 'ENGENHEIRO RESPONSÁVEL'
    };
    onUpdate('reports', [rdo, ...project.reports]);
    setIsAdding(false);
    setForm({ date: new Date().toISOString().split('T')[0], weather: 'ENSOLARADO', activities: '' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Diários de Obra</h3>
        <button onClick={() => setIsAdding(true)} className="bg-amber-500 text-slate-900 font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl">
          <Plus size={18} /> NOVO REGISTRO
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-100 p-6 rounded-2xl mb-8 space-y-4 border border-slate-200 font-black animate-in fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 tracking-widest">Data</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 font-black outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 tracking-widest">Clima</label>
              <select value={form.weather} onChange={e => setForm({...form, weather: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 font-black outline-none">
                <option>ENSOLARADO</option>
                <option>CHUVOSO</option>
                <option>NUBLADO</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-slate-500 tracking-widest">Relatório Técnico / Atividades</label>
            <textarea rows={4} value={form.activities} onChange={e => setForm({...form, activities: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 font-black uppercase outline-none" placeholder="O QUE FOI EXECUTADO HOJE?"></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sair</button>
            <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Salvar RDO</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {project.reports.length === 0 ? (
          <div className="py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs border-2 border-dashed border-slate-100 rounded-3xl">Sem relatórios registrados.</div>
        ) : (
          project.reports.map(r => (
            <div key={r.id} className="bg-white border border-slate-100 p-6 rounded-2xl hover:border-amber-500 transition-all shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-amber-500 p-2 rounded-lg"><Calendar size={14} /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">{new Date(r.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
                  <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-black uppercase text-slate-500">{r.weather}</span>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase">ID #{r.id.slice(-4)}</span>
              </div>
              <p className="text-sm font-black text-slate-700 uppercase leading-relaxed tracking-tight">{r.activities}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase">
                 <User size={12}/> {r.author}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PresenceModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [empName, setEmpName] = useState('');
  
  const addEmployee = () => {
    if(!empName) return;
    const newEmp: Employee = { id: Date.now().toString(), name: empName.toUpperCase(), role: 'EQUIPE', active: true };
    onUpdate('employees', [...project.employees, newEmp]);
    setEmpName('');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Controle de Equipe</h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={empName} 
            onChange={e => setEmpName(e.target.value)}
            className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-black uppercase outline-none" 
            placeholder="Nome Funcionário"
          />
          <button onClick={addEmployee} className="bg-slate-900 text-white p-2 rounded-xl active:scale-95"><Plus size={20}/></button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-black">
        {project.employees.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-300 uppercase tracking-widest text-xs">Nenhum funcionário cadastrado.</div>
        ) : (
          project.employees.map(emp => (
            <div key={emp.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
               <div>
                 <p className="text-sm text-slate-900 uppercase">{emp.name}</p>
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest">{emp.role}</p>
               </div>
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const PhotosModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ProjectPhoto = {
          id: Date.now().toString(),
          url: reader.result as string,
          caption: 'Registro de Campo',
          date: new Date().toLocaleDateString('pt-BR')
        };
        onUpdate('photos', [newPhoto, ...project.photos]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Galeria de Campo</h3>
        <label className="bg-amber-500 text-slate-900 font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl cursor-pointer">
          <Camera size={18} /> UPLOAD FOTO
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {project.photos.map(photo => (
          <div key={photo.id} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden group relative">
            <img src={photo.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Obra" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
               <p className="text-white text-[10px] font-black uppercase tracking-widest">{photo.date}</p>
            </div>
          </div>
        ))}
        {project.photos.length === 0 && <div className="col-span-full text-center py-20 text-slate-300 uppercase tracking-widest text-xs">Sem fotos registradas.</div>}
      </div>
    </div>
  );
};

const ContractsModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project }) => (
  <div className="p-20 text-center font-black uppercase text-slate-300">Repositório de Contratos HLH (Módulo Jurídico).</div>
);

const LocationModule: React.FC<{project: Project}> = ({ project }) => (
  <div className="h-[500px]">
    <iframe 
      width="100%" 
      height="100%" 
      frameBorder="0" 
      src={`https://www.google.com/maps?q=${encodeURIComponent(project.location)}&output=embed`} 
      title="Mapa da Obra"
    />
  </div>
);

export default ProjectDetail;
