import React, { memo, useEffect, useState } from 'react';
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {

  NewMemberForm,
} from '@/types';

// Validation schema
const PHONE_REGEX = /^[0-9]{9}$/;
const DNI_REGEX = /^[0-9]{8}$/;
const CE_REGEX = /^[0-9]{9}$/;

// const beneficiarySchema = z.object({
//   full_name: z.string().min(1, 'Nombre del beneficiario es requerido'),
//   document_type: z.enum(['DNI', 'CE'] as const),
//   document_number: z.string().refine(
//     (val) => val.match(DNI_REGEX) || val.match(CE_REGEX),
//     () => ({
//       message: `Número de documento inválido`,
//     })
//   ),
//   phone: z
//     .string()
//     .regex(PHONE_REGEX, 'Número de teléfono debe tener 9 dígitos'),
//   address: z.string().min(1, 'Dirección del beneficiario es requerida'),
// });

const memberFormSchema = z.object({
  id: z.string(),
  full_name: z.string().min(1, 'Nombre completo es requerido'),
  document_type: z.enum(['DNI', 'CE'] as const),
  document_number: z.string().refine(
    (val) => val.match(DNI_REGEX) || val.match(CE_REGEX),
    () => ({
      message: `Número de documento inválido`,
    })
  ),
  role: z.enum([
    'socio',
    'presidente',
    'tesorero',
    'secretario',
    'facilitador',
  ] as const),
  productive_activity: z.string(),
  birth_date: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      console.log('Birth date validation:', { date, age, isValid: age >= 18 });
      return age >= 18;
    },
    { message: 'El miembro debe ser mayor de 18 años' }
  ),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Número de teléfono debe tener 9 dígitos'),
  address: z.string().min(1, 'Dirección es requerida'),
  join_date: z
    .string()
    .refine((date) => new Date(date) <= new Date(), {
      message: 'La fecha de ingreso no puede ser futura',
    }),
  gender: z.enum(['Masculino', 'Femenino', 'Otro'] as const),
  password: z.string().min(6, 'La contraseña debe tener al menos 8 caracteres'),
  additional_info: z.string(),
  beneficiary: z
    .object({
      full_name: z.string().min(1, 'Nombre del beneficiario es requerido'),
      document_type: z.enum(['DNI', 'CE'] as const),
      document_number: z.string().refine(
        (val) => val.match(DNI_REGEX) || val.match(CE_REGEX),
        () => ({
          message: `Número de documento inválido`,
        })
      ),
      phone: z
        .string()
        .regex(PHONE_REGEX, 'Número de teléfono debe tener 9 dígitos'),
      address: z.string().min(1, 'Dirección del beneficiario es requerida'),
    })
    .required(),
});

interface MemberFormProps {
  initialData: NewMemberForm;
  isLoading: boolean;
  isEditing: boolean;
  onSubmit: (formData: NewMemberForm) => Promise<void>;
  onCancel: () => void;
  formatDateForInput: (date: string) => string;
}

const MemberForm = memo(
  ({
    initialData,
    isLoading,
    isEditing,
    onSubmit,
    onCancel,
    formatDateForInput,
  }: MemberFormProps) => {
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [wasSubmitted, setWasSubmitted] = useState(false);
    console.log("wasSubmitted: ", wasSubmitted);
    console.log("isEditing: ", isEditing);

    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<NewMemberForm>({
      resolver: zodResolver(memberFormSchema),
      defaultValues: initialData,
      mode: 'onBlur',
      reValidateMode: 'onChange',
    });


useEffect(() => {
  if (!wasSubmitted) {
    reset(initialData);
  }
}, [initialData, reset, wasSubmitted]);

  const onFormSubmit = handleSubmit(
    async (data) => {
      setWasSubmitted(true);
      try {
        await onSubmit(data);
        toast({
          title: isEditing ? 'Miembro actualizado' : 'Miembro agregado',
          description: `${data.full_name} ha sido ${
            isEditing ? 'actualizado' : 'agregado'
          } exitosamente`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description:
            'Hubo un error al procesar el formulario. Por favor intente nuevamente.',
          variant: 'destructive',
        });
        console.error('Form submission error:', error);
      }
    },
    (formErrors) => {
      setWasSubmitted(true);
      // Get all error messages
      const errorMessages = Object.entries(formErrors)
        .map(([field, error]) => {
          if (field === 'beneficiary') {
            const beneficiaryErrors = error as Record<
              string,
              { message: string }
            >;
            return Object.values(beneficiaryErrors)
              .map((err) => err.message)
              .join(', ');
          }
          return error.message;
        })
        .filter(Boolean)
        .join(', ');

      toast({
        title: 'Campos inválidos',
        description: 'Por favor revise los siguientes campos: ' + errorMessages,
        variant: 'destructive',
      });
      console.error('Validation errors:', formErrors);
    }
  );
    
    const handleCancel = () => {
      setWasSubmitted(false);
      onCancel();
    };

    return (
      <form
        onSubmit={onFormSubmit}
        className='space-y-6'
      >
        <div>
          <h3 className='text-lg font-medium'>Información del Miembro</h3>
          <div className='grid grid-cols-2 gap-4 mt-4'>
            {/* Nombre Completo */}
            <div>
              <Label htmlFor='full_name'>Nombre Completo</Label>
              <Controller
                name='full_name'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={errors.full_name ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.full_name && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Tipo de Documento */}
            <div>
              <Label htmlFor='document_type'>Tipo de Documento</Label>
              <Controller
                name='document_type'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={errors.document_type ? 'border-red-500' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='DNI'>DNI</SelectItem>
                      <SelectItem value='CE'>CE</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.document_type && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.document_type.message}
                </p>
              )}
            </div>

            {/* Número de Documento */}
            <div>
              <Label htmlFor='document_number'>Número de Documento</Label>
              <Controller
                name='document_number'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={errors.document_number ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.document_number && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.document_number.message}
                </p>
              )}
            </div>

            {/* Cargo */}
            <div>
              <Label htmlFor='role'>Cargo</Label>
              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={errors.role ? 'border-red-500' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='socio'>Socio</SelectItem>
                      <SelectItem value='presidente'>Presidente</SelectItem>
                      <SelectItem value='tesorero'>Tesorero</SelectItem>
                      <SelectItem value='secretario'>Secretario</SelectItem>
                      <SelectItem value='facilitador'>Facilitador</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Actividad Productiva */}
            <div>
              <Label htmlFor='productive_activity'>Actividad Productiva</Label>
              <Controller
                name='productive_activity'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={
                      errors.productive_activity ? 'border-red-500' : ''
                    }
                  />
                )}
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <Label htmlFor='birth_date'>Fecha de Nacimiento</Label>
              <Controller
                name='birth_date'
                control={control}
                render={({ field }) => (
                  <Input
                    type='date'
                    {...field}
                    value={formatDateForInput(field.value)}
                    className={errors.birth_date ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.birth_date && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.birth_date.message}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor='phone'>Celular</Label>
              <Controller
                name='phone'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.phone && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <Label htmlFor='address'>Dirección</Label>
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.address && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Fecha de Ingreso */}
            <div>
              <Label htmlFor='join_date'>Fecha de Ingreso</Label>
              <Controller
                name='join_date'
                control={control}
                render={({ field }) => (
                  <Input
                    type='date'
                    {...field}
                    value={formatDateForInput(field.value)}
                    className={errors.join_date ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.join_date && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.join_date.message}
                </p>
              )}
            </div>

            {/* Género */}
            <div>
              <Label htmlFor='gender'>Género</Label>
              <Controller
                name='gender'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={errors.gender ? 'border-red-500' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Masculino'>Masculino</SelectItem>
                      <SelectItem value='Femenino'>Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <Label htmlFor='password'>
                {isEditing
                  ? 'Nueva Contraseña (dejar en blanco para mantener)'
                  : 'Contraseña'}
              </Label>
              <div className='relative'>
                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                  )}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className='h-4 w-4'
                    >
                      <path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' />
                      <path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' />
                      <path d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' />
                      <line
                        x1='2'
                        x2='22'
                        y1='2'
                        y2='22'
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className='h-4 w-4'
                    >
                      <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
                      <circle
                        cx='12'
                        cy='12'
                        r='3'
                      />
                    </svg>
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Información Adicional */}
            <div className='col-span-2'>
              <Label htmlFor='additional_info'>Información Adicional</Label>
              <Controller
                name='additional_info'
                control={control}
                render={({ field }) => (
                  // ... (previous code remains the same until the additional_info field)
                  <Textarea
                    {...field}
                    className={errors.additional_info ? 'border-red-500' : ''}
                    rows={4}
                  />
                )}
              />
              {errors.additional_info && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.additional_info.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Beneficiary Section */}
        <div>
          <h3 className='text-lg font-medium'>Información del Beneficiario</h3>
          <div className='grid grid-cols-2 gap-4 mt-4'>
            {/* Nombre del Beneficiario */}
            <div>
              <Label htmlFor='beneficiary.full_name'>Nombre Completo</Label>
              <Controller
                name='beneficiary.full_name'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={
                      errors.beneficiary?.full_name ? 'border-red-500' : ''
                    }
                  />
                )}
              />
              {errors.beneficiary?.full_name && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.beneficiary.full_name.message}
                </p>
              )}
            </div>

            {/* Tipo de Documento del Beneficiario */}
            <div>
              <Label htmlFor='beneficiary.document_type'>
                Tipo de Documento
              </Label>
              <Controller
                name='beneficiary.document_type'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={
                        errors.beneficiary?.document_type
                          ? 'border-red-500'
                          : ''
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='DNI'>DNI</SelectItem>
                      <SelectItem value='CE'>CE</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.beneficiary?.document_type && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.beneficiary.document_type.message}
                </p>
              )}
            </div>

            {/* Número de Documento del Beneficiario */}
            <div>
              <Label htmlFor='beneficiary.document_number'>
                Número de Documento
              </Label>
              <Controller
                name='beneficiary.document_number'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={
                      errors.beneficiary?.document_number
                        ? 'border-red-500'
                        : ''
                    }
                  />
                )}
              />
              {errors.beneficiary?.document_number && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.beneficiary.document_number.message}
                </p>
              )}
            </div>

            {/* Teléfono del Beneficiario */}
            <div>
              <Label htmlFor='beneficiary.phone'>Celular</Label>
              <Controller
                name='beneficiary.phone'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={
                      errors.beneficiary?.phone ? 'border-red-500' : ''
                    }
                  />
                )}
              />
              {errors.beneficiary?.phone && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.beneficiary.phone.message}
                </p>
              )}
            </div>

            {/* Dirección del Beneficiario */}
            <div className='col-span-2'>
              <Label htmlFor='beneficiary.address'>Dirección</Label>
              <Controller
                name='beneficiary.address'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className={
                      errors.beneficiary?.address ? 'border-red-500' : ''
                    }
                  />
                )}
              />
              {errors.beneficiary?.address && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.beneficiary.address.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex justify-end gap-2'>
          {isEditing && (
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button
            type='submit'
            disabled={isLoading}
          >
            {isLoading
              ? 'Procesando...'
              : isEditing
              ? 'Actualizar Miembro'
              : 'Agregar Miembro'}
          </Button>
        </div>
      </form>
    );
  }
);
MemberForm.displayName = 'MemberForm';
export default MemberForm;