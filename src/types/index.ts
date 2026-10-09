export type UserRole = 'Editor' | 'Visualizador';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  corporateName: string; // Razão Social
  tradeName: string; // Nome Fantasia
  cnpj: string;
  contact: string; // Email / Telefone
  technicalLead: string; // Responsável Técnico
  creaCau: string; // CREA / CAU
  createdBy: string;
  createdAt: string;
  isDemo?: boolean;
}

export type WorkStatus = 'Em andamento' | 'Concluída' | 'Paralisada' | 'Planejamento';

export interface Work {
  id: string;
  code: string; // Código
  name: string; // Nome da Obra
  clientName: string; // Cliente / Contratante
  address: string; // Endereço
  technicalLead: string; // Responsável Técnico
  creaCau: string; // CREA/CAU
  startDate: string; // Data de início
  expectedEndDate: string; // Término previsto
  status: WorkStatus;
  physicalProgress: number; // Percentual de avanço físico (%)
  driveFolderUrl?: string; // Pasta vinculada no Google Drive
  companyId?: string;
  createdBy: string;
  createdAt: string;
  isDemo?: boolean;
}

export type TeamCategory = 'Engenheiro' | 'Mestre' | 'Encarregado' | 'Estagiário' | 'Outro';

export interface TeamMember {
  id: string;
  workId: string;
  name: string;
  category: TeamCategory;
  role: string;
  company: string;
  phone?: string;
  email?: string;
  createdBy: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface RDOPhoto {
  id: string;
  url: string;
  caption: string;
  createdAt?: string;
}

export type RDOStatus = 'Rascunho' | 'Finalizado';

export interface RDOReport {
  id: string;
  sequentialNumber: number; // Número sequencial (ex: 1, 2, 3...)
  date: string; // DD/MM/AAAA
  workId: string;
  workName: string;
  status: RDOStatus;
  authorId: string;
  authorName: string;
  authorRole: string;
  
  // Condições climáticas por período
  weatherMorning: string; // ex: Bom, Chuvoso, Nublado, Impraticável
  weatherAfternoon: string;
  weatherNight: string;
  
  // Frentes e Atividades
  workFronts: string; // Etapas e frentes de serviço
  activities: string; // Atividades executadas detalhadas
  progressPercent: number; // Percentual de execução informado
  
  // Recursos
  labor: string; // Mão de obra por função e empresa (ex: 4 pedreiros, 6 serventes)
  equipment: string; // Equipamentos e maquinários
  materials: string; // Materiais recebidos ou utilizados
  
  // Ocorrências e Segurança
  occurrences: string; // Ocorrências e imprevistos
  safety: string; // Medidas de segurança, DDS, acidentes (se houve)
  observations: string; // Observações gerais
  
  // Fotos com legenda
  photos: RDOPhoto[];
  
  pdfGenerated?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface DocumentItem {
  id: string;
  workId: string;
  title: string;
  category: 'RDO' | 'Foto' | 'Documento';
  fileUrl?: string;
  driveFolder?: string;
  createdBy: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface AIParsedRDO {
  weatherMorning?: string;
  weatherAfternoon?: string;
  weatherNight?: string;
  workFronts?: string;
  activities?: string;
  progressPercent?: number | null;
  labor?: string;
  equipment?: string;
  materials?: string;
  occurrences?: string;
  safety?: string;
  observations?: string;
  uncertainties?: string[];
  summary?: string;
}
