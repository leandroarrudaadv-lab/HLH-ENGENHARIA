
import React, { useState } from 'react';
import { X, HardHat, MapPin } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, location: string) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-500">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <HardHat size={24} />
            Nova Obra
          </h2>
          <button onClick={onClose} className="p-2 text-slate-900 hover:bg-slate-900/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome do Empreendimento</label>
              <div className="relative">
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="EX: TORRE SUL" 
                  className="w-full pl-4 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização / Bairro</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin size={18} />
                </div>
                <input 
                  type="text" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Centro, Maceió - AL" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs tracking-widest"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onAdd(name, location)}
              disabled={!name || !location}
              className="flex-[2] bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 uppercase text-xs tracking-widest"
            >
              Criar Projeto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
