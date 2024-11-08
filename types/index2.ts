import { unknown } from 'zod';

export type User = {
  id: string;
  email?: string;
  username: string;
  password: string;
  phone: string;
  role: string;
  member_role?: string;
  document_type?: string;
  document_number?: string;
  full_name?: string;
  productive_activity?: string;
  birth_date?: Date;
  address?: string;
  join_date?: Date;
  gender?: string;
  additional_info?: string;
  status: string;
  beneficiary_full_name?: string;
  beneficiary_document_type?: string;
  beneficiary_document_number?: string;
  beneficiary_phone?: string;
  beneficiary_address?: string;
  createdAt: Date;
  updatedAt: Date;
  acciones: Accion[];
  createdJuntas: Junta[];
  memberJuntas: JuntaMember[];
  multas: Multa[];
  prestamos: Prestamo[];
};

export type Junta = {
  id: string;
  name: string;
  description?: string;
  fecha_inicio: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  acciones: Accion[];
  agenda: AgendaItem[];
  capital?: CapitalSocial;
  createdBy: User;
  members: JuntaMember[];
  multas: Multa[];
  prestamos: Prestamo[];
};

export type JuntaMember = {
  id: string;
  juntaId: string;
  userId: string;
  joinedAt: Date;
  junta: Junta;
  user: User;
};

export type Prestamo = {
  id: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  pagos: PagoPrestamo[];
  junta: Junta;
  member: User;
};

export type PagoPrestamo = {
  id: string;
  amount: number;
  date: Date;
  prestamoId: string;
  prestamo: Prestamo;
};

export type Multa = {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  junta: Junta;
  member: User;
};

export type Accion = {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  junta: Junta;
  member: User;
};

export type AgendaItem = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  junta: Junta;
};

export type CapitalSocial = {
  id: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  junta: Junta;
  gastos: GastoCapital[];
  ingresos: IngresoCapital[];
};

export type IngresoCapital = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  capitalSocialId: string;
  capitalSocial: CapitalSocial;
};

export type GastoCapital = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  capitalSocialId: string;
  capitalSocial: CapitalSocial;
};

// Type definitions
export type MemberRole = 'socio' | 'presidente' | 'tesorero' | 'secretario';
export type DocumentType = 'DNI' | 'CE';
export type Gender = 'Masculino' | 'Femenino' | 'Otro';
export type Status = 'Activo' | 'Inactivo';

export interface Beneficiary {
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  phone: string;
  address: string;
}

export interface Member {
  id: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  role: MemberRole;
  member_role: string;
  document_type: DocumentType;
  document_number: string;
  full_name: string;
  productive_activity: string;
  birth_date: string;
  address: string;
  join_date: string;
  joinedAt: string;
  gender: Gender;
  additional_info: string;
  status: Status;
  beneficiary_full_name: string;
  beneficiary_document_type: string;
  beneficiary_document_number: string;
  beneficiary_phone: string;
  beneficiary_address: string;
  createdAt: string;
  updatedAt: string;
  beneficiary: Beneficiary;
}

export interface NewMemberForm {
  id: string;
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  role: MemberRole;
  productive_activity: string;
  birth_date: string;
  phone: string;
  address: string;
  join_date: string;
  gender: Gender;
  password: string;
  additional_info: string;
  beneficiary: {
    full_name: string;
    document_type: DocumentType;
    document_number: string;
    phone: string;
    address: string;
  };
}

export interface UseErrorReturn {
  perro: string | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  isError: boolean;
}

export interface ErrorType extends Error {
  cause?: ErrorType;
  message: string;
  error: string;
  response: {
    data: {
      message: string;
      error: string;
    };
  };
}
