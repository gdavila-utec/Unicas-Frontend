import React, { memo } from 'react';
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
import { MemberRole, DocumentType, Gender } from '@/types';

interface Beneficiary {
  full_name: string;
  document_type: DocumentType;
  document_number: string;
  phone: string;
  address: string;
}

interface FormData {
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
  additional_info: string;
  beneficiary: Beneficiary;
}

interface MemberFormProps {
  initialData: FormData & { password: string };
  isLoading: boolean;
  isEditing: boolean;
  onSubmit: (formData: FormData & { password: string }) => void;
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
    const [formData, setFormData] = React.useState<FormData>(() => {
      const { password: _, ...restData } = initialData;
      return restData;
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const finalPassword = password || initialData.password;
      if (!finalPassword) {
        return;
      }

      onSubmit({
        ...formData,
        password: finalPassword,
      });
    };

    React.useEffect(() => {
      const { password: currentPassword, ...restData } = initialData;
      setFormData(restData);
      setPassword(currentPassword);
    }, [initialData]);

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
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isEditing
                    ? 'Dejar en blanco para mantener la contraseña actual'
                    : ''
                }
                required={!isEditing}
              />
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
