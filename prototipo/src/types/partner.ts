export interface InitialData {
  contractNumber: string;
  year: number;
  month: number;
  day: number;
  name: string;
  rg: string;
  cpf: string;
  email: string;
  cnpj: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  companyName: string;
  tradeName: string;
  academicName: string;
  witnessName: string;
  witnessEmail: string;
  witnessCpf: string;
  contact: string;
  partnershipType: string;
  capturedBy: string;
}

export interface FinalRegistration {
  name: string;
  city: string;
  state: string;
  createEmail: boolean;
  systemRegistration: boolean;
  partnerPortalAccess: boolean;
  pincelAccess: boolean;
  createDriveFolder: boolean;
  sendToCaptation: boolean;
  directToLorraine: boolean;
}

export interface TrainingData {
  name: string;
  city: string;
  state: string;
  status: 'pending' | 'in-progress' | 'completed';
  registration: boolean;
  lorrainContact: boolean;
  trainingStart: Date | null;
  cademiCourse: boolean;
  commercialTraining: boolean;
}

export interface Partner {
  id: string;
  initialData: InitialData;
  finalRegistration: FinalRegistration | null;
  trainingData: TrainingData | null;
  currentStage: 'initial' | 'final' | 'training' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
}