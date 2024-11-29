import { z } from 'zod';

const PHONE_REGEX = /^[0-9]{9}$/;
const DNI_REGEX = /^[0-9]{8}$/;
const CE_REGEX = /^[0-9]{9}$/;

const beneficiarySchema = z.object({
  full_name: z.string().min(1, 'Nombre del beneficiario es requerido'),
  document_type: z.enum(['DNI', 'CE'] as const),
  document_number: z.string().refine(
    (val) => val.match(DNI_REGEX) || val.match(CE_REGEX),
    () => ({
      message: 'Número de documento inválido',
    })
  ),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Número de teléfono debe tener 9 dígitos'),
  address: z.string().min(1, 'Dirección del beneficiario es requerida'),
});

// Base member schema containing all common fields between create and edit
const baseMemberSchema = z.object({
  full_name: z.string().min(1, 'Nombre completo es requerido'),
  document_type: z.enum(['DNI', 'CE'] as const),
  document_number: z.string().refine(
    (val) => val.match(DNI_REGEX) || val.match(CE_REGEX),
    () => ({
      message: 'Número de documento inválido',
    })
  ),
  role: z.enum(['socio', 'directivo', 'facilitador', 'organizacion'] as const),
  productive_activity: z.string(),
  birth_date: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    },
    { message: 'El miembro debe ser mayor de 18 años' }
  ),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Número de teléfono debe tener 9 dígitos'),
  address: z.string().min(1, 'Dirección es requerida'),
  join_date: z.string().refine((date) => new Date(date) <= new Date(), {
    message: 'La fecha de ingreso no puede ser futura',
  }),
  gender: z.enum(['Masculino', 'Femenino'] as const),
  additional_info: z.string(),
  beneficiary: beneficiarySchema,
});

// Create schema extends base schema and adds password requirement
export const createMemberSchema = baseMemberSchema.extend({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// Edit schema extends base schema, makes password optional, and requires an id
export const editMemberSchema = baseMemberSchema.extend({
  id: z.string({
    required_error: 'ID es requerido para editar un miembro',
  }),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional(),
});

// Define types based on the schemas
export type CreateMemberForm = z.infer<typeof createMemberSchema>;
export type EditMemberForm = z.infer<typeof editMemberSchema>;
export type BaseMemberForm = z.infer<typeof baseMemberSchema>;

export type UpdateMemberVariables = {
  memberId: string;
  data: EditMemberForm;
};

export const isEditMemberForm = (
  form: CreateMemberForm | EditMemberForm
): form is EditMemberForm => {
  return 'id' in form;
};


export const capitalMovementSchema = z.object({
  id: z.string(),
  amount: z.number(),
  type: z.string(),
  direction: z.string(),
  description: z.string(),
  createdAt: z.string(),
  juntaId: z.string(),
  prestamoId: z.string().nullable(),
  multaId: z.string().nullable(),
  accionId: z.string().nullable(),
  pagoId: z.string().nullable(),
});

export const accionDetalleSchema = z.object({
  id: z.string(),
  type: z.string(),
  amount: z.number(),
  shareValue: z.number(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  juntaId: z.string(),
  memberId: z.string(),
  affects_capital: z.boolean(),
  agendaItemId: z.string().nullable(),
  capital_movements: z.array(capitalMovementSchema),
});

export const prestamoActivoSchema = z.object({
  id: z.string(),
  monto_solicitado: z.number(),
  monto_adeudo: z.number(),
  cuotas_pendientes: z.number(),
  monto_proxima_cuota: z.number(),
  fecha_proxima_cuota: z.string(),
  pagos_realizados: z.number(),
  estado: z.string(),
});

export const memberProfileSchema = z.object({
  member: baseMemberSchema.extend({
    id: z.string(),
    estado: z.string(),
  }),
  acciones: z.object({
    detalle: z.array(accionDetalleSchema),
    resumen: z.object({
      cantidad: z.number(),
      valor: z.number(),
    }),
  }),
  prestamos: z.object({
    activos: z.array(prestamoActivoSchema),
    historial: z.array(prestamoActivoSchema),
  }),
  multas: z.object({
    pendientes: z.array(z.unknown()),
    historial: z.array(z.unknown()),
  }),
});

export type MemberProfileData = z.infer<typeof memberProfileSchema>;


export function transformMemberToFormData(
  memberInfo: MemberProfileData['member']
): EditMemberForm {
  return {
    id: memberInfo.id,
    full_name: memberInfo.full_name,
    document_type: memberInfo.document_type,
    document_number: memberInfo.document_number,
    role: memberInfo.role,
    productive_activity: memberInfo.productive_activity,
    birth_date: memberInfo.birth_date,
    phone: memberInfo.phone,
    address: memberInfo.address,
    join_date: memberInfo.join_date,
    gender: memberInfo.gender,
    additional_info: memberInfo.additional_info || '',
    beneficiary: {
      full_name: memberInfo.beneficiary?.full_name || '',
      document_type: memberInfo.beneficiary?.document_type || 'DNI',
      document_number: memberInfo.beneficiary?.document_number || '',
      phone: memberInfo.beneficiary?.phone || '',
      address: memberInfo.beneficiary?.address || '',
    },
    // Password is optional for editing
  };
}


