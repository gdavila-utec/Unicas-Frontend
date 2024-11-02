interface User {
  id: string;
  email?: string;
  username: string;
  role: 'ADMIN' | 'FACILITATOR' | 'USER';
  document_type?: string;
  document_number?: string;
  full_name?: string;
  birth_date?: Date;
  address?: string;
  phone: string;
  additional_info?: string;
  beneficiary_address?: string;
  beneficiary_document_number?: string;
  beneficiary_document_type?: string;
  beneficiary_full_name?: string;
  beneficiary_phone?: string;
  gender?: string;
  join_date?: Date;
  member_role?: string;
  productive_activity?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  acciones: Accion[];
  createdJuntas: Junta[];
  memberJuntas: JuntaMember[];
  multas: Multa[];
  prestamos: Prestamo[];
}

// Junta types
export interface Junta {
  id: string;
  name: string;
  description?: string;
  fecha_inicio: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  available_capital: number;
  base_capital: number;
  current_capital: number;
  createdBy: User;
  members: JuntaMember[];
  acciones: Accion[];
  agenda: AgendaItem[];
  capital?: CapitalSocial;
  multas: Multa[];
  prestamos: Prestamo[];
}

export interface JuntaMember {
  id: string;
  juntaId: string;
  userId: string;
  joinedAt: Date;
  user: User;
  junta: Junta;
}

export interface Member {
  additional_info: null | string;
  address: string;
  beneficiary_address: string;
  beneficiary_document_number: string;
  beneficiary_document_type: string;
  beneficiary_full_name: string;
  beneficiary_phone: string;
  birth_date: string;
  createdAt: string;
  document_number: string;
  document_type: string;
  email: string;
  full_name: string;
  gender: string;
  id: string;
  join_date: string;
  joinedAt: string;
  member_role: string;
  password: string;
  phone: string;
  productive_activity: string;
  role: string;
  status: string;
  updatedAt: string;
  username: string;
}

// Capital types
interface CapitalMovement {
  id: string;
  amount: number;
  type: string;
  direction: string;
  description?: string;
  createdAt: Date;
  juntaId: string;
  prestamoId?: string;
  multaId?: string;
  accionId?: string;
  pagoId?: string;
}

interface CapitalSocial {
  id: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  gastos: GastoCapital[];
  ingresos: IngresoCapital[];
}

interface IngresoCapital {
  id: string;
  amount: number;
  description: string;
  date: Date;
  capitalSocialId: string;
}

interface GastoCapital {
  id: string;
  amount: number;
  description: string;
  date: Date;
  capitalSocialId: string;
}

// Accion types
interface Accion {
  id: string;
  type: string;
  amount: number;
  shareValue: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  affects_capital: boolean;
}

// Prestamo types
export interface Prestamo {
  id: string;
  amount: number;
  description?: string;
  status: string;
  request_date: Date;
  monthly_interest: number;
  number_of_installments: number;
  approved: boolean;
  rejected: boolean;
  rejection_reason?: string;
  paid: boolean;
  remaining_amount: number;
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  original_prestamo_id?: string;
  affects_capital: boolean;
  avalId?: string;
  capital_at_time: number;
  capital_snapshot?: unknown;
  form_cost: number;
  form_purchased: boolean;
  guarantee_detail?: string;
  guarantee_type: string;
  loan_code: string;
  loan_number: number;
  payment_type: string;
  reason: string;
  loan_type: string;
  pagos: PagoPrestamo[];
  junta: Junta;
  member: User;
}

// Pago types
interface PagoPrestamo {
  id: string;
  amount: number;
  date: Date;
  prestamoId: string;
  original_pago_id?: string;
  affects_capital: boolean;
  prestamo: Prestamo;
}

// Response types
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Multa {
  id: string;
  amount: number;
  description: string;
  status: MultaStatus; // Default: "PENDING"
  createdAt: Date;
  updatedAt: Date;
  juntaId: string;
  memberId: string;
  affects_capital: boolean;
  junta?: Junta;
  member?: User;
  capital_movements?: CapitalMovement[];
}

// You might also want these enums for the status field
enum MultaStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export type PaymentType = 'MENSUAL' | 'QUINCENAL' | 'SEMANAL';

export type GuaranteeType = 'AVAL' | 'INMUEBLE' | 'HIPOTECARIA' | 'PRENDARIA';

export interface CreatePrestamoDto {
  juntaId: string;
  memberId: string;
  number_of_installments: number;
  loan_type:
    | 'CUOTA_REBATIR'
    | 'CUOTA_FIJA'
    | 'CUOTA_VENCIMIENTO'
    | 'CUOTA_VARIABLE';
  payment_type:
    | 'CUOTA_REBATIR'
    | 'CUOTA_FIJA'
    | 'CUOTA_VENCIMIENTO'
    | 'CUOTA_VARIABLE';
  reason: string;
  guarantee_type: 'AVAL' | 'INMUEBLE' | 'HIPOTECARIA' | 'PRENDARIA';
  guarantee_detail: string;
  form_purchased: boolean;
  amount: string;
  monthly_interest: string;
  request_date: string;
}
