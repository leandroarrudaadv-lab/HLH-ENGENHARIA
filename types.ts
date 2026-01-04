
export type ProjectStatus = 'Em andamento' | 'Concluída' | 'Planejamento';

export interface Employee {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

export interface DailyReport {
  id: string;
  date: string;
  weather: string;
  activities: string;
  observations: string;
  author: string;
}

export interface MaterialPurchase {
  id: string;
  date: string;
  item: string;
  quantity: string;
  supplier: string;
  value: number;
  observation?: string;
}

export interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export interface PresenceRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  status: 'Presente' | 'Faltou' | 'Atestado';
}

export interface Contract {
  id: string;
  type: 'cliente' | 'empreiteiro';
  name: string;
  url: string;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  location: string;
  progress: number;
  employees: Employee[];
  reports: DailyReport[];
  purchases: MaterialPurchase[];
  photos: ProjectPhoto[];
  presence: PresenceRecord[];
  contracts: Contract[];
  documents: string[];
}
