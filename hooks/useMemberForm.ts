import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useToast } from '@/hooks/use-toast';
import { NewMemberForm } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import {
  CreateMemberForm,
  EditMemberForm,
  UpdateMemberVariables,
  createMemberSchema,
  editMemberSchema,
  isEditMemberForm,
} from '@/z';



// interface InitialMemberData extends EditMemberForm {
//   // Ensures the id property is required for editing
//   id: string;
// }

// const memberFormSchema = z.object({
//   id: z.string(),
//   full_name: z.string().min(1, 'Nombre completo es requerido'),
//   document_type: z.enum(['DNI', 'CE'] as const),
//   document_number: z.string().refine(
//     (val) => val.match(DNI_REGEX) || val.match(CE_REGEX),
//     () => ({
//       message: `Número de documento inválido`,
//     })
//   ),
//   role: z.enum(['socio', 'directivo', 'organizacion', 'facilitador'] as const),
//   productive_activity: z.string(),
//   birth_date: z.string().refine(
//     (date) => {
//       const birthDate = new Date(date);
//       const today = new Date();
//       const age = today.getFullYear() - birthDate.getFullYear();
//       return age >= 18;
//     },
//     { message: 'El miembro debe ser mayor de 18 años' }
//   ),
//   phone: z
//     .string()
//     .regex(PHONE_REGEX, 'Número de teléfono debe tener 9 dígitos'),
//   address: z.string().min(1, 'Dirección es requerida'),
//   // join_date: z.string().refine((date) => new Date(date) <= new Date(), {
//   //   message: 'La fecha de ingreso no puede ser futura',
//   // }),
//   gender: z.enum(['Masculino', 'Femenino'] as const),
//   password: z.string().min(6, 'La contraseña debe tener al menos 8 caracteres'),
//   additional_info: z.string(),
//   beneficiary: z
//     .object({
//       full_name: z.string().min(1, 'Nombre del beneficiario es requerido'),
//       document_type: z.enum(['DNI', 'CE'] as const),
//       document_number: z.string().refine(
//         (val) => val.match(DNI_REGEX) || val.match(CE_REGEX),
//         () => ({
//           message: `Número de documento inválido`,
//         })
//       ),
//       phone: z
//         .string()
//         .regex(PHONE_REGEX, 'Número de teléfono debe tener 9 dígitos'),
//       address: z.string().min(1, 'Dirección del beneficiario es requerida'),
//     })
//     .required(),
// });

interface UseMemberFormProps {
  juntaId: string;
  initialData: CreateMemberForm | EditMemberForm;
  isEditing: boolean;
  setIsSuccess: (value: boolean) => void;
  onSubmit: (formData: NewMemberForm) => Promise<void>;
  onCancel: () => void;
}

export const useMemberForm = ({
  juntaId,
  initialData,
  isEditing,
  setIsSuccess,
  onCancel: onClose,
}: UseMemberFormProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
    const queryClient = useQueryClient();
 const defaultFormData = isEditing && 'id' in initialData
   ? { ...initialData, id: initialData.id }
   : initialData;
  


  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<CreateMemberForm | EditMemberForm>({
    resolver: zodResolver(isEditing ? editMemberSchema : createMemberSchema),
    defaultValues: defaultFormData,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldUnregister: true,
  });

    useEffect(() => {
      if (isEditing && isEditMemberForm(initialData)) {
        // Keep the ID field in sync when editing
        setValue('id', initialData.id);
      }
    }, [isEditing, initialData, setValue]);

  // const formatDateForInput = (
  //   dateString: string | null | undefined
  // ): string => {
  //   if (!dateString) return '';
  //   try {
  //     const date = new Date(dateString);
  //     return date.toISOString().split('T')[0];
  //   } catch (error) {
  //     console.error('Date formatting error:', error);
  //     return '';
  //   }
  // };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // const handleFormSubmit = handleSubmit(
  //   async (data) => {
  //     try {
  //       await onSubmit(data);
  //       toast({
  //         title: isEditing ? 'Miembro actualizado' : 'Miembro agregado',
  //         description: `${data.full_name} ha sido ${
  //           isEditing ? 'actualizado' : 'agregado'
  //         } exitosamente`,
  //       });
  //     } catch (error) {
  //       toast({
  //         title: 'Error',
  //         description:
  //           'Hubo un error al procesar el formulario. Por favor intente nuevamente.',
  //         variant: 'destructive',
  //       });
  //       console.error('Form submission error:', error);
  //     }
  //   },
  //   (formErrors) => {
  //     const values = getValues();
  //     console.log('values: ', values);

  //     // Set the values of each form field manually
  //     Object.entries(values).forEach(([field, value]) => {
  //       setValue(field as keyof NewMemberForm, value);
  //     });

  //     const errorMessages = Object.entries(formErrors)
  //       .map(([field, error]) => {
  //         if (field === 'beneficiary') {
  //           const beneficiaryErrors = error as Record<
  //             string,
  //             { message: string }
  //           >;
  //           return Object.values(beneficiaryErrors)
  //             .map((err) => err.message)
  //             .join(', ');
  //         }
  //         return error.message;
  //       })
  //       .filter(Boolean)
  //       .join(', ');

  //     toast({
  //       title: 'Campos inválidos',
  //       description: 'Por favor revise los siguientes campos: ' + errorMessages,
  //       variant: 'destructive',
  //     });
  //     console.error('Validation errors:', formErrors);
  //   }
  // );



    const invalidateMemberQueries = () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const [resource] = query.queryKey;
          return ['members', 'memberStats', 'member'].includes(
            resource as string
          );
        },
      });
    };

  const { mutateAsync: createMember, status: createStatus } = useMutation<
    void,
    unknown,
    CreateMemberForm
  >({
    mutationFn: async (formData: CreateMemberForm) => {
      console.log('formData: ', formData);
      const formattedData = {
        ...formData,
        birth_date: formatDateForAPI(formData.birth_date),
        join_date: formatDateForAPI(formData.join_date),
      };
      console.log('Formatted data being sent:', formattedData);
      const response = api.post(
        `members/${juntaId}/add/${formattedData.document_number}`,
        formattedData
      );
      console.log('isCreating response: ', response);
    },
    onSuccess: () => {
      invalidateMemberQueries()
      toast({
        title: 'Éxito',
        description: 'Miembro agregado correctamente',
      });
      reset();
      onClose()
      setIsSuccess(true);
    },
    onError: (error: unknown) => {
      const errorMessage = error || 'Error al agregar miembro';
      toast({
        title: 'Error',
        description: String(errorMessage),
        variant: 'destructive',
      });
    },
  });

  const { mutateAsync: updateMember, status: updateStatus } = useMutation<
    void,
    unknown,
    UpdateMemberVariables
  >({
    mutationFn: async ({
      memberId,
      data,
    }: UpdateMemberVariables) => {
      const formattedData = {
        ...data,
        birth_date: formatDateForAPI(data.birth_date),
        join_date: formatDateForAPI(data.join_date),
      };
      const response = await api.patch(`members/${memberId}`, formattedData);
      return response;
    },
    onSuccess: () => {
      invalidateMemberQueries();
      toast({
        title: 'Éxito',
        description: 'Miembro actualizado correctamente',
      });
      reset();
      onClose();
    },
    onError: (error: unknown) => {
      const errorMessage = error || 'Error al actualizar miembro';
      toast({
        title: 'Error',
        description: String(errorMessage),
        variant: 'destructive',
      });
    },
  });

  function isMemberFormWithId(data: unknown): data is EditMemberForm {
    return !!data && typeof data === 'object' && 'id' in data;
  }

  const handleFormSubmit = handleSubmit(
    async (data) => {
      try {
        if (isEditing && isEditMemberForm(data)) {
          // TypeScript now knows this is definitely an EditMemberForm
          if (!isMemberFormWithId(data)) {
            throw new Error('Missing member ID for update operation');
          }
          await updateMember({
            memberId: data.id,
            data: {
              ...data,
              // Format dates properly
              birth_date: formatDateForAPI(data.birth_date),
              join_date: formatDateForAPI(data.join_date),
            },
          });
           toast({
             title: 'Éxito',
             description: `${data.full_name} ha sido actualizado exitosamente`,
           });
        } else {
          await createMember(data as CreateMemberForm);
        }
      } catch (error) {
        console.error('Form submission error:', error);
         toast({
           title: 'Error',
           description:
             'Hubo un error al procesar el formulario. Por favor intente nuevamente.',
           variant: 'destructive',
         });
      }
    },
    (formErrors) => {
      console.log('Raw validation errors:', formErrors);
      const formatted = Object.entries(formErrors).reduce(
        (acc, [key, error]) => {
          return {
            ...acc,
            [key]: {
              value: getValues(key as keyof NewMemberForm),
              error: error.message,
            },
          };
        },
        {}
      );

      console.log('Formatted validation errors:', formatted);
      const values = getValues();
      console.log('values: ', values);

      Object.entries(values).forEach(([field, value]) => {
        setValue(field as keyof NewMemberForm, value);
      });

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
    reset(initialData);
    onClose();
  };

  return {
    control,
    errors,
    showPassword,
    setShowPassword,
    handleFormSubmit,
    handleCancel,
    isLoading: createStatus === 'pending' || updateStatus === 'pending',
  };
};