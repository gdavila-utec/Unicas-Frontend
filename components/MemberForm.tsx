import React, { memo, useEffect } from 'react';
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
  MemberRole,
  DocumentType,
  Gender,
  NewMemberForm,
} from '@/types';

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
    const [password, setPassword] = React.useState(initialData.password);
    const [showPassword, setShowPassword] = React.useState(false);
    // Change the type here to NewMemberForm instead of MemberFormData
    const [formData, setFormData] = React.useState<NewMemberForm>(() => {
      // Include password in the initial state
      return {
        ...initialData,
        password: initialData.password, // Make sure password is included
      };
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const finalPassword = password || initialData.password;
      if (!finalPassword) {
        return;
      }

      const completeFormData: NewMemberForm = {
        ...formData,
        password: finalPassword,
        id: initialData.id || '',
        document_type: formData.document_type || 'DNI',
        role: formData.role || 'socio',
        gender: formData.gender || 'Masculino',
        birth_date:
          formData.birth_date || new Date().toISOString().split('T')[0],
        join_date: formData.join_date || new Date().toISOString().split('T')[0],
        beneficiary: {
          ...formData.beneficiary,
          document_type: formData.beneficiary.document_type || 'DNI',
        },
      };

      onSubmit(completeFormData);
    };

    useEffect(() => {
      // const { password: currentPassword, ...restData } = initialData;
      setFormData({
        ...initialData,
        password: password || initialData.password, // Make sure password is included
      });
    }, [initialData, password]);

    return (
      <form
        onSubmit={handleSubmit}
        className='space-y-6'
      >
        <div>
          <h3 className='text-lg font-medium'>Información del Miembro</h3>
          <div className='grid grid-cols-2 gap-4 mt-4'>
            <div>
              <Label htmlFor='full_name'>Nombre Completo</Label>
              <Input
                id='full_name'
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor='document_type'>Tipo de Documento</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value: DocumentType) => {
                  setFormData((prev) => ({ ...prev, document_type: value }));
                }}
              >
                <SelectTrigger id='document_type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='DNI'>DNI</SelectItem>
                  <SelectItem value='CE'>CE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='document_number'>Número de Documento</Label>
              <Input
                id='document_number'
                value={formData.document_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    document_number: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor='role'>Cargo</Label>
              <Select
                value={formData.role}
                onValueChange={(value: MemberRole) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id='role'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='socio'>Socio</SelectItem>
                  <SelectItem value='presidente'>Presidente</SelectItem>
                  <SelectItem value='tesorero'>Tesorero</SelectItem>
                  <SelectItem value='secretario'>Secretario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='productive_activity'>Actividad Productiva</Label>
              <Input
                id='productive_activity'
                value={formData.productive_activity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    productive_activity: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor='birth_date'>Fecha de Nacimiento</Label>
              <Input
                id='birth_date'
                type='date'
                value={formatDateForInput(formData.birth_date)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birth_date: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor='phone'>Celular</Label>
              <Input
                id='phone'
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor='address'>Dirección</Label>
              <Input
                id='address'
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor='join_date'>Fecha de Ingreso</Label>
              <Input
                id='join_date'
                type='date'
                value={formatDateForInput(formData.join_date)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    join_date: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor='gender'>Género</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: Gender) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger id='gender'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Masculino'>Masculino</SelectItem>
                  <SelectItem value='Femenino'>Femenino</SelectItem>
                  <SelectItem value='Otro'>Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='password'>
                {isEditing
                  ? 'Nueva Contraseña (dejar en blanco para mantener)'
                  : 'Contraseña'}
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isEditing
                      ? 'Dejar en blanco para mantener la contraseña actual'
                      : ''
                  }
                  required={!isEditing}
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
                  <span className='sr-only'>
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
          <div className='mt-4'>
            <Label htmlFor='additional_info'>Información Adicional</Label>
            <Textarea
              id='additional_info'
              value={formData.additional_info}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  additional_info: e.target.value,
                }))
              }
              className='h-24'
            />
          </div>
        </div>

        <div>
          <h3 className='text-lg font-medium'>Información del Beneficiario</h3>
          <div className='grid grid-cols-2 gap-4 mt-4'>
            <div>
              <Label htmlFor='beneficiary_full_name'>Nombre Completo</Label>
              <Input
                id='beneficiary_full_name'
                value={formData.beneficiary.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beneficiary: {
                      ...prev.beneficiary,
                      full_name: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor='beneficiary_document_type'>
                Tipo de Documento
              </Label>
              <Select
                value={formData.beneficiary.document_type}
                onValueChange={(value: DocumentType) =>
                  setFormData((prev) => ({
                    ...prev,
                    beneficiary: {
                      ...prev.beneficiary,
                      document_type: value,
                    },
                  }))
                }
              >
                <SelectTrigger id='beneficiary_document_type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='DNI'>DNI</SelectItem>
                  <SelectItem value='CE'>CE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='beneficiary_document_number'>
                Número de Documento
              </Label>
              <Input
                id='beneficiary_document_number'
                value={formData.beneficiary.document_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beneficiary: {
                      ...prev.beneficiary,
                      document_number: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor='beneficiary_phone'>Celular</Label>
              <Input
                id='beneficiary_phone'
                value={formData.beneficiary.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beneficiary: {
                      ...prev.beneficiary,
                      phone: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className='col-span-2'>
              <Label htmlFor='beneficiary_address'>Dirección</Label>
              <Input
                id='beneficiary_address'
                value={formData.beneficiary.address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beneficiary: {
                      ...prev.beneficiary,
                      address: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-2'>
          {isEditing && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
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
