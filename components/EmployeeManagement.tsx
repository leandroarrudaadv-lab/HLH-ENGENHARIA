
import React, { useState } from 'react';
import { Employee, Project } from '../types';
import { UserPlus, Search, Briefcase, UserCircle, Users, DollarSign, MapPin, X, ChevronDown } from 'lucide-react';

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
    const updatedEmployees = employees.map(e => 
      e.id === employeeId ? { ...e, projectId: newProjectId } : e
    );
    setEmployees(updatedEmployees);

    const employeeToMove = updatedEmployees.find(e => e.id === employeeId);
    if (!employeeToMove) return;

    onUpdateProjects(prevProjects => prevProjects.map(p => {
      const teamWithoutTarget = p.employees.filter(e => e.id !== employeeId);
      if (p.id === newProjectId) {
        return { ...p, employees: [...teamWithoutTarget, { ...employeeToMove }] };
      }
      return { ...p, employees: teamWithoutTarget };
    }));
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">Colaboradores HLH</h1>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em]">Controle central de colaboradores e alocações</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`font-black px-8 py-4 rounded-2xl flex items-center gap-2 uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 ${isAdding ? 'bg-amber-500 text-slate-900' : 'bg-amber-500 text-slate-900 shadow-amber-500/20'}`}
        >
          {isAdding ? <X size={18} /> : <UserPlus size={18} />} 
          {isAdding ? 'CANCELAR' : 'NOVO COLABORADOR'}
        </button>
      </div>

      {isAdding && (
        <div className="p-1 rounded-[3rem] border-2 border-blue-400/30 mb-12 shadow-2xl animate-in zoom-in duration-300">
           <div className="bg-white p-10 rounded-[2.8rem] border-2 border-amber-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors">
                    <UserCircle size={22} />
                  </div>
                  <input 
                    type="text" 
                    autoFocus
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-4 py-5 font-black uppercase text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-300"
                    placeholder="DIGITE O NOME..."
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo / Função</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors">
                    <Briefcase size={22} />
                  </div>
                  <input 
                    type="text" 
                    value={newEmployee.role}
                    onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-4 py-5 font-black uppercase text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-300"
                    placeholder="EX: PEDREIRO..."
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Diária (R$)</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors">
                    <DollarSign size={22} />
                  </div>
                  <input 
                    type="number" 
                    value={newEmployee.dailyRate}
                    onChange={e => setNewEmployee({...newEmployee, dailyRate: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-4 py-5 font-black text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleAdd}
                className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all hover:bg-slate-800"
              >
                CADASTRAR COLABORADOR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <Search className="text-slate-300" size={24} />
          <input 
            type="text" 
            placeholder="BUSCAR COLABORADORES NA BASE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none font-black text-sm uppercase tracking-tight flex-1 placeholder:text-slate-300"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <th className="px-10 py-5">Colaborador</th>
                <th className="px-10 py-5">Cargo</th>
                <th className="px-10 py-5">Obra Atual</th>
                <th className="px-10 py-5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-black">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Users size={64} />
                      <p className="text-xs uppercase tracking-[0.3em]">Nenhum colaborador encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-500 text-lg font-black shadow-lg">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-slate-900 text-sm uppercase tracking-tight font-black">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] text-slate-500 uppercase tracking-widest font-black border border-slate-200">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="relative max-w-[220px]">
                        <select 
                          value={emp.projectId || ''} 
                          onChange={(e) => handleProjectChange(emp.id, e.target.value)}
                          className={`w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all appearance-none cursor-pointer pr-10 ${emp.projectId ? 'text-slate-900 border-amber-200' : 'text-slate-400'}`}
                        >
                          <option value="">SEM ALOCAÇÃO</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-sm text-slate-900 font-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(emp.dailyRate || 0)}
                      </span>
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
