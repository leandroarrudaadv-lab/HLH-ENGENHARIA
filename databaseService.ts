
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Employee } from './types';

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
    if (!supabase) return { success: false, message: "Aguardando URL/Chave." };
    
    try {
      const { error } = await supabase.from('projects').select('id').limit(1);
      
      if (error) {
        console.error("Erro no teste de conexão Supabase:", error);
        if (error.code === '42P01') {
          return { success: false, message: "Tabelas não encontradas. Rode o SQL.", code: 'MISSING_TABLES' };
        }
        if (error.message.includes('permission denied')) {
          return { success: false, message: "Permissão Negada! Verifique RLS no Supabase.", code: 'PERMISSION_DENIED' };
        }
        return { success: false, message: "Erro: " + error.message, code: error.code };
      }
      
      return { success: true, message: "Conectado e com permissão de leitura!" };
    } catch (e: any) {
      return { success: false, message: "Erro de rede ao conectar.", code: 'FETCH_ERROR' };
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
    if (error) {
      console.error("Erro ao carregar obras:", error);
      throw error;
    }
    return data || [];
  },

  async saveProjects(projects: Project[]): Promise<void> {
    if (!supabase) return;
    
    // Mapeamento explícito para as colunas do SQL (respeitando Case Sensitivity se necessário)
    const formatted = projects.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      location: p.location,
      progress: p.progress,
      mainPhoto: p.mainPhoto,
      employees: p.employees,
      reports: p.reports,
      purchases: p.purchases,
      photos: p.photos,
      presence: p.presence,
      contracts: p.contracts,
      documents: p.documents
    }));

    const { error } = await supabase.from('projects').upsert(formatted, { onConflict: 'id' });
    
    if (error) {
      console.error("Erro CRÍTICO ao salvar obras no Supabase:", error);
      throw error;
    }
  },

  async getEmployees(): Promise<Employee[]> {
    if (!supabase) {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : [];
    }
    const { data, error } = await supabase.from('employees').select('*');
    if (error) {
      console.error("Erro ao carregar colaboradores:", error);
      throw error;
    }
    return data || [];
  },

  async saveEmployees(employees: Employee[]): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('employees').upsert(employees, { onConflict: 'id' });
    if (error) {
      console.error("Erro CRÍTICO ao salvar colaboradores no Supabase:", error);
      throw error;
    }
  }
};
