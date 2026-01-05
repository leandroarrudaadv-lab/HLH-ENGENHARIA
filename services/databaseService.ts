
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
  let url = (window as any).process?.env?.SUPABASE_URL || '';
  let key = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      url = config.url || url;
      key = config.key || key;
    } catch (e) {
      console.error("Erro ao ler config", e);
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
    if (!supabase) return { success: false, message: "URL ou Chave não configuradas." };
    
    try {
      // Tenta ler a tabela de projetos para ver se existe
      const { error } = await supabase.from('projects').select('id').limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          return { success: false, message: "Tabelas não encontradas no Supabase.", code: 'MISSING_TABLES' };
        }
        return { success: false, message: error.message, code: error.code };
      }
      
      return { success: true, message: "Conexão estabelecida com sucesso!" };
    } catch (e: any) {
      return { success: false, message: "Falha crítica na conexão.", code: 'FETCH_ERROR' };
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
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data || [];
  },

  async saveProjects(projects: Project[]): Promise<void> {
    if (!supabase) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      return;
    }
    const { error } = await supabase.from('projects').upsert(projects, { onConflict: 'id' });
    if (error) throw error;
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
    if (!supabase) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      return;
    }
    const { error } = await supabase.from('employees').upsert(employees, { onConflict: 'id' });
    if (error) throw error;
  }
};
