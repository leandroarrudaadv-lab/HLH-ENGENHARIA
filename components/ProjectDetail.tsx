
import React, { useState, useRef } from 'react';
import { Project, DailyReport, MaterialPurchase, PresenceRecord, ProjectPhoto, Contract, Employee, ProjectStatus } from '../types';
import { 
  Camera, FileText, Users, ShoppingCart, 
  Plus, Calendar, User, Folder, Star,
  Trash2, ExternalLink, MapPin, Briefcase, 
  ChevronRight, ArrowLeft, Printer, Check, ClipboardList, ChevronLeft, Save, Map as MapIcon,
  Percent, Upload, FileUp, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

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
    <div className="animate-in slide-in-from-right duration-300 max-w-6xl mx-auto">
      {/* Header Obra */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 mb-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
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
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status da Obra</span>
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

      <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
        <TabButton label="DIÁRIO RDO" active={activeTab === 'rdo'} onClick={() => setActiveTab('rdo')} icon={<FileText size={16}/>} />
        <TabButton label="COMPRAS" active={activeTab === 'purchases'} onClick={() => setActiveTab('purchases')} icon={<ShoppingCart size={16}/>} />
        <TabButton label="FREQUÊNCIA" active={activeTab === 'presence'} onClick={() => setActiveTab('presence')} icon={<Users size={16}/>} />
        <TabButton label="FOTOS" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} icon={<Camera size={16}/>} />
        <TabButton label="CONTRATOS" active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} icon={<Briefcase size={16}/>} />
        <TabButton label="MAPA" active={activeTab === 'location'} onClick={() => setActiveTab('location')} icon={<MapPin size={16}/>} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
        {activeTab === 'rdo' && <RDOModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'purchases' && <PurchasesModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'presence' && <PresenceModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'photos' && <PhotosModule project={project} onUpdate={handleSubUpdate} onUpdateAll={onUpdate} />}
        {activeTab === 'contracts' && <ContractsModule project={project} onUpdate={handleSubUpdate} />}
        {activeTab === 'location' && <LocationModule project={project} onUpdateLocation={handleLocationUpdate} />}
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

const PresenceModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const togglePresence = (employee: Employee, status: 'Presente' | 'Faltou' | 'Atestado') => {
    const existingIndex = project.presence.findIndex(p => p.date === selectedDate && p.employeeId === employee.id);
    let newPresence = [...project.presence];

    if (existingIndex > -1) {
      if (newPresence[existingIndex].status === status) {
        newPresence.splice(existingIndex, 1);
      } else {
        newPresence[existingIndex] = { ...newPresence[existingIndex], status };
      }
    } else {
      newPresence.push({
        id: Date.now().toString() + Math.random(),
        date: selectedDate,
        employeeId: employee.id,
        employeeName: employee.name,
        status
      });
    }
    onUpdate('presence', newPresence);
  };

  const getStatus = (employeeId: string) => {
    return project.presence.find(p => p.date === selectedDate && p.employeeId === employeeId)?.status;
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Controle de Frequência</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Marque a presença diária da equipe alocada</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <Calendar size={18} className="text-amber-500" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none font-black text-sm text-slate-900"
          />
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-4">Colaborador</th>
              <th className="px-8 py-4">Função</th>
              <th className="px-8 py-4 text-center">Controle de Presença</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-black">
            {project.employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <Users size={48} />
                    <p className="text-xs uppercase tracking-widest">Nenhum colaborador alocado nesta obra.</p>
                    <p className="text-[10px] normal-case">Vá em 'Colaboradores' para vincular profissionais.</p>
                  </div>
                </td>
              </tr>
            ) : (
              project.employees.map(emp => {
                const status = getStatus(emp.id);
                return (
                  <tr key={emp.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 text-sm font-black">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-slate-900 text-sm uppercase tracking-tight">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.role}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <PresenceBtn 
                          active={status === 'Presente'} 
                          onClick={() => togglePresence(emp, 'Presente')} 
                          label="PRESENTE" 
                          icon={<CheckCircle2 size={16}/>}
                          color="green"
                        />
                        <PresenceBtn 
                          active={status === 'Faltou'} 
                          onClick={() => togglePresence(emp, 'Faltou')} 
                          label="FALTOU" 
                          icon={<XCircle size={16}/>}
                          color="red"
                        />
                        <PresenceBtn 
                          active={status === 'Atestado'} 
                          onClick={() => togglePresence(emp, 'Atestado')} 
                          label="ATESTADO" 
                          icon={<AlertCircle size={16}/>}
                          color="amber"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PresenceBtn: React.FC<{active: boolean, onClick: () => void, label: string, icon: React.ReactNode, color: 'green' | 'red' | 'amber'}> = ({ active, onClick, label, icon, color }) => {
  const colors = {
    green: active ? 'bg-green-500 text-white shadow-green-500/20' : 'text-slate-300 hover:text-green-500 hover:bg-green-50',
    red: active ? 'bg-red-500 text-white shadow-red-500/20' : 'text-slate-300 hover:text-red-500 hover:bg-red-50',
    amber: active ? 'bg-amber-500 text-white shadow-amber-500/20' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
  };

  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-transparent ${colors[color]}`}
    >
      {icon} {label}
    </button>
  );
};

const PhotosModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void, onUpdateAll: (p: Project) => void}> = ({ project, onUpdate, onUpdateAll }) => {
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

  const setMainPhoto = (url: string) => {
    onUpdateAll({ ...project, mainPhoto: url });
  };

  const deletePhoto = (id: string) => {
    if (confirm('EXCLUIR ESTA FOTO?')) {
      const filtered = project.photos.filter(p => p.id !== id);
      onUpdate('photos', filtered);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Galeria da Obra</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Escolha a foto principal para o painel</p>
        </div>
        <label className="bg-amber-500 text-slate-900 font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl cursor-pointer hover:bg-amber-600 transition-all active:scale-95">
          <Plus size={18} /> UPLOAD FOTO
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {project.photos.map(photo => (
          <div key={photo.id} className="group relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border-2 border-transparent transition-all hover:border-amber-500 shadow-sm">
            <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Obra" />
            
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
               <button 
                 onClick={() => setMainPhoto(photo.url)}
                 className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project.mainPhoto === photo.url ? 'bg-amber-500 text-slate-900' : 'bg-white text-slate-900 hover:bg-amber-500'}`}
               >
                 <Star size={14} fill={project.mainPhoto === photo.url ? "currentColor" : "none"} /> 
                 {project.mainPhoto === photo.url ? 'Foto Principal' : 'Tornar Principal'}
               </button>
               <button 
                 onClick={() => deletePhoto(photo.id)}
                 className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white rounded-xl transition-all"
               >
                 <Trash2 size={14} /> Excluir
               </button>
            </div>
            {project.mainPhoto === photo.url && (
              <div className="absolute top-3 left-3 bg-amber-500 text-slate-900 p-2 rounded-xl shadow-lg border-2 border-amber-600">
                <Star size={14} fill="currentColor" />
              </div>
            )}
          </div>
        ))}
        {project.photos.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <Camera size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-300 uppercase font-black tracking-widest text-[10px]">A galeria está vazia. Faça o primeiro upload.</p>
          </div>
        )}
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

const ContractsModule: React.FC<{project: Project, onUpdate: (key: keyof Project, data: any) => void}> = ({ project, onUpdate }) => {
  const [currentFolder, setCurrentFolder] = useState<'root' | 'cliente' | 'empreiteiro'>('root');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', fileName: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('POR FAVOR, SELECIONE APENAS ARQUIVOS PDF.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ 
          ...prev, 
          url: reader.result as string,
          fileName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addContract = () => {
    if (!form.name || !form.url || currentFolder === 'root') {
      alert('PREENCHA O NOME E ANEXE UM PDF OU INSIRA UM LINK.');
      return;
    }
    const newContract: Contract = {
      id: Date.now().toString(),
      type: currentFolder as 'cliente' | 'empreiteiro',
      name: form.name.toUpperCase(),
      url: form.url,
      date: new Date().toLocaleDateString('pt-BR')
    };
    onUpdate('contracts', [...project.contracts, newContract]);
    setIsAdding(false);
    setForm({ name: '', url: '', fileName: '' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('EXCLUIR ESTE DOCUMENTO?')) {
      const filtered = project.contracts.filter(c => c.id !== id);
      onUpdate('contracts', filtered);
    }
  };

  const filteredContracts = project.contracts.filter(c => c.type === currentFolder);

  if (currentFolder === 'root') {
    return (
      <div className="p-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">Repositório de Contratos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FolderCard 
            title="CONTRATO HLH CLIENTE" 
            count={project.contracts.filter(c => c.type === 'cliente').length}
            onClick={() => setCurrentFolder('cliente')}
          />
          <FolderCard 
            title="CONTRATO EMPREITEIROS" 
            count={project.contracts.filter(c => c.type === 'empreiteiro').length}
            onClick={() => setCurrentFolder('empreiteiro')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => { setCurrentFolder('root'); setIsAdding(false); }}
            className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest mb-2 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar para Pastas
          </button>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {currentFolder === 'cliente' ? 'Contratos HLH Cliente' : 'Contratos Empreiteiros'}
          </h3>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 uppercase text-[10px] tracking-widest shadow-xl active:scale-95"
        >
          <Plus size={18} /> NOVO DOCUMENTO
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 space-y-4 animate-in zoom-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Nome do Documento</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black uppercase outline-none focus:ring-2 focus:ring-amber-500" 
                placeholder="EX: CONTRATO DE ADESÃO V01" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Anexo PDF ou Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={form.fileName || form.url} 
                  onChange={e => setForm({...form, url: e.target.value, fileName: ''})} 
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="Link do arquivo ou selecione o PDF" 
                  readOnly={!!form.fileName}
                />
                <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-amber-500 text-slate-900 px-4 rounded-xl flex items-center gap-2 hover:bg-amber-600 transition-colors"
                >
                  <FileUp size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setIsAdding(false); setForm({ name: '', url: '', fileName: '' }); }} className="px-6 py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
            <button onClick={addContract} className="bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">SALVAR DOCUMENTO</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredContracts.length === 0 ? (
          <div className="py-20 text-center text-slate-300 uppercase font-black tracking-widest text-xs border-2 border-dashed border-slate-100 rounded-3xl">Esta pasta está vazia.</div>
        ) : (
          filteredContracts.map(c => (
            <div key={c.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-amber-500 transition-all shadow-sm group">
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <FileText className="text-slate-400 group-hover:text-amber-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Adicionado em {c.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><ExternalLink size={20} /></a>
                <button onClick={() => handleDelete(c.id)} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FolderCard: React.FC<{title: string, count: number, onClick: () => void}> = ({ title, count, onClick }) => (
  <button onClick={onClick} className="bg-white border border-slate-200 p-8 rounded-3xl text-left hover:border-amber-500 hover:shadow-xl transition-all group flex items-center justify-between">
    <div className="flex items-center gap-6">
      <div className="bg-amber-500/10 p-5 rounded-2xl group-hover:bg-amber-500 transition-colors">
        <Folder className="text-amber-600 group-hover:text-slate-900" size={32} />
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight">{title}</h4>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{count} DOCUMENTO(S)</p>
      </div>
    </div>
    <ChevronRight className="text-slate-200 group-hover:text-amber-500 transition-colors" size={24} />
  </button>
);

const LocationModule: React.FC<{project: Project, onUpdateLocation: (loc: string) => void}> = ({ project, onUpdateLocation }) => {
  const [newLoc, setNewLoc] = useState(project.location);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateLocation(newLoc);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização da Obra</label>
          <div className="relative group">
            <input 
              type="text" 
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              onFocus={() => setIsEditing(true)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black pr-12 focus:ring-2 focus:ring-amber-500 outline-none transition-all" 
              placeholder="Endereço ou URL Maps..." 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors">
              <MapIcon size={20} />
            </div>
          </div>
        </div>
        {isEditing && (
          <button onClick={handleSave} className="w-full md:w-auto mt-2 md:mt-5 bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest shadow-lg active:scale-95 animate-in slide-in-from-right-4">
            <Save size={18} /> ATUALIZAR MAPA
          </button>
        )}
      </div>
      <div className="flex-1 bg-slate-200 relative">
        <iframe width="100%" height="100%" frameBorder="0" src={`https://www.google.com/maps?q=${encodeURIComponent(project.location)}&output=embed`} title="Mapa da Obra" />
      </div>
    </div>
  );
};

export default ProjectDetail;
