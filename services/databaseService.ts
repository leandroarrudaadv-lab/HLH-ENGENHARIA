
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Employee } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'hlh_projects_cloud_v1',
  EMPLOYEES: 'hlh_employees_cloud_v1',
  CONFIG: 'hlh_supabase_config'
};

let supabase: SupabaseClient | null = null;

// Inicializa ou reinicializa o cliente Supabase
export const initSupabase = () => {
  const configStr = localStorage.getItem(STORAGE_KEYS.CONFIG);
  let url = (window as any).process?.env?.SUPABASE_URL || '';
  let key = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

  if (configStr) {
    const config = JSON.parse(configStr);
    url = config.url || url;
    key = config.key || key;
  }

  if (url && key) {
    supabase = createClient(url, key);
    return true;
  }
  supabase = null;
  return false;
};

// Inicialização imediata
initSupabase();

export const DatabaseService = {
  isConfigured(): boolean {
    return !!supabase;
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

    const { data, error } = await supabase
      .from('projects')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async saveProjects(projects: Project[]): Promise<void> {
    if (!supabase) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      return;
    }

    const { error } = await supabase
      .from('projects')
      .upsert(projects, { onConflict: 'id' });
    
    if (error) throw error;
  },

  async getEmployees(): Promise<Employee[]> {
    if (!supabase) {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : [];
    }

    const { data, error } = await supabase
      .from('employees')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async saveEmployees(employees: Employee[]): Promise<void> {
    if (!supabase) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      return;
    }

    const { error } = await supabase
      .from('employees')
      .upsert(employees, { onConflict: 'id' });
    
    if (error) throw error;
  }
};
