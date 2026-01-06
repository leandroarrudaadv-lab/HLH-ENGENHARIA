
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Employee } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'hlh_projects_cloud_v1',
  EMPLOYEES: 'hlh_employees_cloud_v1',
  CONFIG: 'hlh_supabase_config'
};

let supabase: SupabaseClient | null = null;

export const initSupabase = () => {
  const configStr = localStorage.getItem(STORAGE_KEYS.CONFIG);
  let url = '';
  let key = '';

  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      url = config.url || '';
      key = config.key || '';
    } catch (e) {
      console.error("Erro ao ler config local", e);
    }
  }

  if (url && key && url.startsWith('http')) {
    supabase = createClient(url, key);
    return true;
  }
  supabase = null;
  return false;
};

initSupabase();

export const DatabaseService = {
  isConfigured(): boolean {
    return !!supabase;
  },

  async testConnection(): Promise<{success: boolean, message: string, code?: string}> {
    if (!supabase) return { success: false, message: "URL ou Chave faltando." };
    
    try {
      const { error } = await supabase.from('projects').select('id').limit(1);
      
      if (error) {
        console.error("Erro Supabase:", error);
        // Códigos comuns do Postgres/Supabase
        if (error.code === '42P01') return { success: false, message: "Tabelas não criadas. Vá em SQL Setup.", code: '42P01' };
        if (error.code === '42501') return { success: false, message: "Permissão Negada (RLS). Rode o SQL!", code: '42501' };
        if (error.code === 'PGRST116') return { success: true, message: "Conectado (Vazio)." };
        return { success: false, message: `Erro ${error.code}: ${error.message}`, code: error.code };
      }
      
      return { success: true, message: "Conectado com Sucesso!" };
    } catch (e: any) {
      return { success: false, message: "Falha de rede ou URL inválida.", code: 'FETCH_ERROR' };
    }
  },

  saveConfig(url: string, key: string) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ url, key }));
    return initSupabase();
  },

  async getProjects(): Promise<Project[]> {
    if (!supabase) {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async saveProjects(projects: Project[]): Promise<void> {
    if (!supabase) return;
    
    // Limpamos o objeto para o formato que o Postgres aceita
    const formatted = projects.map(p => ({
      id: String(p.id),
      name: p.name || 'SEM NOME',
      status: p.status || 'Planejamento',
      location: p.location || '',
      progress: Number(p.progress) || 0,
      mainPhoto: p.mainPhoto || null,
      employees: p.employees || [],
      reports: p.reports || [],
      purchases: p.purchases || [],
      photos: p.photos || [],
      presence: p.presence || [],
      contracts: p.contracts || [],
      documents: p.documents || []
    }));

    if (formatted.length === 0) return;

    const { error } = await supabase.from('projects').upsert(formatted, { onConflict: 'id' });
    if (error) {
      console.error("Erro ao salvar projetos:", error);
      throw error;
    }
  },

  async getEmployees(): Promise<Employee[]> {
    if (!supabase) {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase.from('employees').select('*');
    if (error) throw error;
    return data || [];
  },

  async saveEmployees(employees: Employee[]): Promise<void> {
    if (!supabase) return;
    
    const formatted = employees.map(e => ({
      id: String(e.id),
      name: e.name || '',
      role: e.role || '',
      active: !!e.active,
      dailyRate: Number(e.dailyRate) || 0,
      projectId: e.projectId ? String(e.projectId) : null
    }));

    if (formatted.length === 0) return;

    const { error } = await supabase.from('employees').upsert(formatted, { onConflict: 'id' });
    if (error) {
      console.error("Erro ao salvar colaboradores:", error);
      throw error;
    }
  }
};
