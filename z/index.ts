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
  role: z.enum(['socio', 'directivo', 'organizacion', 'facilitador'] as const),
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
  gender: z.enum(['Masculino', 'Femenino', 'Otro'] as const),
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
