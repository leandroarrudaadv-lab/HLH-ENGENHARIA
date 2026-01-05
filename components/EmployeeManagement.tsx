
import React, { useState } from 'react';
import { Employee, Project } from '../types';
import { UserPlus, Search, Trash2, ShieldCheck, Briefcase, UserCircle, Users, DollarSign, MapPin, X } from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  projects: Project[];
  onUpdateProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, setEmployees, projects, onUpdateProjects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', dailyRate: '' });

  const handleAdd = () => {
    if (!newEmployee.name || !newEmployee.role) return;
    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name.toUpperCase(),
      role: newEmployee.role.toUpperCase(),
      dailyRate: newEmployee.dailyRate ? parseFloat(newEmployee.dailyRate) : 0,
      active: true,
      projectId: ''
    };
    setEmployees(prev => [...prev, employee]);
    setNewEmployee({ name: '', role: '', dailyRate: '' });
    setIsAdding(false);
  };

  const handleProjectChange = (employeeId: string, newProjectId: string) => {
    // 1. Atualiza a lista global de colaboradores
    const updatedEmployees = employees.map(e => 
      e.id === employeeId ? { ...e, projectId: newProjectId } : e
    );
    setEmployees(updatedEmployees);

    // 2. Sincroniza com as listas de equipe das obras
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    onUpdateProjects(prevProjects => prevProjects.map(p => {
      // Remove o colaborador de qualquer obra que ele estivesse antes
      const filtered = p.employees.filter(e => e.id !== employeeId);
      
      // Se for a nova obra alvo, adiciona ele
      if (p.id === newProjectId) {
        return { ...p, employees: [...filtered, { ...employee, projectId: newProjectId }] };
      }
      return { ...p, employees: filtered };
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('EXCLUIR ESTE COLABORADOR DO CADASTRO GERAL?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      // Remove também de qualquer projeto onde ele possa estar
      onUpdateProjects(prev => prev.map(p => ({
        ...p,
        employees: p.employees.filter(e => e.id !== id)
      })));
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">Colaboradores HLH</h1>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Controle central de ativos e equipes</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`font-black px-6 py-3 rounded-2xl flex items-center gap-2 uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 ${isAdding ? 'bg-amber-500 text-slate-900' : 'bg-amber-500 text-slate-900 shadow-amber-500/20'}`}
        >
          {isAdding ? <X size={18} /> : <UserPlus size={18} />} 
          {isAdding ? 'CANCELAR' : 'NOVO COLABORADOR'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-1 rounded-[2.5rem] border-2 border-blue-400 mb-10 shadow-2xl animate-in zoom-in duration-300">
           <div className="bg-white p-8 rounded-[2.3rem] border-2 border-amber-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <UserCircle size={20} />
                  </div>
                  <input 
                    type="text" 
                    autoFocus
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-black uppercase text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="DIGITE O NOME..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo / Função</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Briefcase size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={newEmployee.role}
                    onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-black uppercase text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="EX: PEDREIRO..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Diária (R$)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <DollarSign size={20} />
                  </div>
                  <input 
                    type="number" 
                    value={newEmployee.dailyRate}
                    onChange={e => setNewEmployee({...newEmployee, dailyRate: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 font-black text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleAdd}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all hover:bg-slate-800"
              >
                CADASTRAR COLABORADOR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="BUSCAR COLABORADORES..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none font-black text-sm uppercase tracking-tight flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Colaborador</th>
                <th className="px-8 py-4">Cargo</th>
                <th className="px-8 py-4">Obra Atual</th>
                <th className="px-8 py-4 text-right">Valor</th>
                <th className="px-8 py-4 text-center w-24"></th> {/* Removido texto Ação */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-black">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Users size={48} />
                      <p className="text-xs uppercase tracking-widest">Nenhum colaborador encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-500 text-sm font-black">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-slate-900 text-sm uppercase tracking-tight">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] text-slate-500 uppercase tracking-widest">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative">
                        <select 
                          value={emp.projectId || ''} 
                          onChange={(e) => handleProjectChange(emp.id, e.target.value)}
                          className={`w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer ${emp.projectId ? 'text-slate-900' : 'text-slate-400'}`}
                        >
                          <option value="">SEM ALOCAÇÃO</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <MapPin size={12} className={emp.projectId ? 'text-amber-500' : 'text-slate-300'} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.dailyRate || 0)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remover Colaborador"
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
    </div>
  );
};

export default EmployeeManagement;
