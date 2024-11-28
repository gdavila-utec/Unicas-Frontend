import React, { memo, useState } from 'react';
import { Controller } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import clsx from 'clsx';
import { CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewMemberForm } from '@/types';
import { useMemberForm } from '@/hooks/useMemberForm';

interface MemberFormProps {
  juntaId: string;
  initialData: NewMemberForm;
  isLoading: boolean;
  isEditing: boolean;
  onSubmit: (formData: NewMemberForm) => Promise<void>;
  onCancel: () => void;
  formatDateForInput: (date: string) => string;
}

const MemberForm = memo(
  ({
    juntaId,
    initialData,
    isLoading,
    isEditing,
    onSubmit,
    onCancel,
    formatDateForInput,
  }: MemberFormProps) => {
        const [isSuccess, setIsSuccess] = useState(false);
    const {
      control,
      errors,
      showPassword,
      setShowPassword,
      handleFormSubmit,
      handleCancel,
    } = useMemberForm({
      juntaId,
      initialData,
      isEditing,
      onSubmit,
      onCancel,
      setIsSuccess,
    });

    
    const formContainerClassName = clsx(
      // These classes provide the base styling and ensure smooth transitions
      'w-full p-6 rounded-lg shadow-sm',
      'transition-all duration-500 ease-in-out',
      // We conditionally apply background colors based on the form state
      {
        'bg-white': !isSuccess && !isLoading,
        'bg-green-50': isSuccess, // A subtle green that indicates successgit
        'bg-blue-50/50': isLoading, // A light blue that shows processing
      }
    );

    return (
      <div className={formContainerClassName}>
        <form
          onSubmit={handleFormSubmit}
          className='space-y-6'
        >
          {isSuccess && (
            <div className='absolute top-4 right-4 flex items-center gap-2 text-green-600 animate-fade-in'>
              <CheckCircle className='h-5 w-5' />
              <span>¡Cambios guardados!</span>
            </div>
          )}
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
                        <SelectItem value='directivo'>Directivo</SelectItem>
                        <SelectItem value='organizacion'>
                          Organizacion
                        </SelectItem>
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
                <Label htmlFor='productive_activity'>
                  Actividad Productiva
                </Label>
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
                {errors.productive_activity && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.productive_activity.message}
                  </p>
                )}
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
                        <SelectItem value='Otro'>Otro</SelectItem>
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
            <h3 className='text-lg font-medium'>
              Información del Beneficiario
            </h3>
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
      </div>
    );
  }
);

MemberForm.displayName = 'MemberForm';

export default MemberForm;