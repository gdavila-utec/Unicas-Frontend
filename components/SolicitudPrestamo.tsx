// components/PrestamosSection.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputAmount } from '@/components/ui/input-amount';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useBoardConfig } from '@/store/configValues';
import { usePrestamos } from '@/hooks/usePrestamosSection';
import type { GuaranteeType } from '@/types';

interface PrestamosSectionProps {
  juntaId: string;
}

const SolicitudPrestamo: React.FC<PrestamosSectionProps> = ({ juntaId }) => {

  const { monthlyInterestRate, loanFormValue } = useBoardConfig();
  const {
    formData,
    members,

    selectedMemberInfo,
    avalMemberInfo,
    memberValidation,
    isLoading,
    updateFormData,
    handleInputChange,
    handleSubmit,

  } = usePrestamos(juntaId);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Solicitud de Préstamos</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className='space-y-6'
          >
            {/* Member Selection */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>Seleccionar Miembro</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) => updateFormData({ memberId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar miembro' />
                  </SelectTrigger>
                  <SelectContent>
                    {members
                      .filter((member) => member.member_role === 'socio')
                      .map((member) => (
                        <SelectItem
                          key={member.id}
                          value={member.id}
                        >
                          {member.full_name || member.username}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info Boxes */}
            {formData.memberId && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Beneficiary Info */}
                <div>
                  <h3 className='text-lg font-semibold mb-4'>
                    Información del Solicitante
                  </h3>
                  <div className='grid grid-cols-3 gap-4'>
                    <Card
                      className={cn(
                        'p-4',
                        memberValidation.exceedsLimit &&
                          'bg-red-50 border-red-200'
                      )}
                    >
                      <CardContent>
                        <div
                          className={cn(
                            'text-sm text-gray-500',
                            memberValidation.exceedsLimit && 'text-red-500'
                          )}
                        >
                          Acciones
                        </div>
                        <div
                          className={cn(
                            'text-xl font-bold mt-1',
                            memberValidation.exceedsLimit && 'text-red-600'
                          )}
                        >
                          {selectedMemberInfo.acciones}
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={cn(
                        'p-4',
                        memberValidation.exceedsLimit &&
                          'bg-red-50 border-red-200'
                      )}
                    >
                      <CardContent>
                        <div
                          className={cn(
                            'text-sm text-gray-500',
                            memberValidation.exceedsLimit && 'text-red-500'
                          )}
                        >
                          Valor de acciones
                        </div>
                        <div
                          className={cn(
                            'text-xl font-bold mt-1',
                            memberValidation.exceedsLimit && 'text-red-600'
                          )}
                        >
                          S/. {selectedMemberInfo.accionesValue.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={cn(
                        'p-4',
                        memberValidation.exceedsLimit &&
                          'bg-red-50 border-red-200'
                      )}
                    >
                      <CardContent>
                        <div
                          className={cn(
                            'text-sm text-gray-500',
                            memberValidation.exceedsLimit && 'text-red-500'
                          )}
                        >
                          Monto prestado
                        </div>
                        <div
                          className={cn(
                            'text-xl font-bold mt-1',
                            memberValidation.exceedsLimit && 'text-red-600'
                          )}
                        >
                          S/. {selectedMemberInfo.prestamosValue.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Guarantor Info (when AVAL is selected) */}
                {formData.guaranteeType === 'AVAL' &&
                  formData.guaranteeDetail && (
                    <div>
                      <h3 className='text-lg font-semibold mb-4'>
                        Información del Aval
                      </h3>
                      <div className='grid grid-cols-3 gap-4'>
                        <Card className='p-4'>
                          <CardContent>
                            <div className='text-sm text-gray-500'>
                              Acciones del Aval
                            </div>
                            <div className='text-xl font-bold mt-1'>
                              {avalMemberInfo.acciones}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className='p-4'>
                          <CardContent>
                            <div className='text-sm text-gray-500'>
                              Valor de acciones
                            </div>
                            <div className='text-xl font-bold mt-1'>
                              S/. {avalMemberInfo.accionesValue.toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className='p-4'>
                          <CardContent>
                            <div className='text-sm text-gray-500'>
                              Monto prestado
                            </div>
                            <div className='text-xl font-bold mt-1'>
                              S/. {avalMemberInfo.prestamosValue.toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Loan Form Fields */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='requestDate'>Fecha de Solicitud</Label>
                <Input
                  type='date'
                  id='requestDate'
                  name='requestDate'
                  value={formData.requestDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='amount'>Monto Solicitado</Label>
                <InputAmount
                  type='number'
                  id='amount'
                  name='amount'
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='monthlyInterest'>Interés Mensual (%)</Label>
                <Input
                  type='number'
                  id='monthlyInterest'
                  name='monthlyInterest'
                  value={monthlyInterestRate}
                  disabled
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='installments'>Cantidad de Cuotas (meses)</Label>
                <Input
                  type='number'
                  id='installments'
                  name='installments'
                  value={formData.installments}
                  onChange={handleInputChange}
                />
              </div>

              <div className='space-y-2'>
                <Label>Forma de Pago</Label>
                <Select
                  value={formData.paymentType}
                  onValueChange={(value) =>
                    updateFormData({ paymentType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar forma de pago' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CUOTA_REBATIR'>
                      Cuota a rebatir
                    </SelectItem>
                    <SelectItem value='CUOTA_FIJA'>Cuota fija</SelectItem>
                    <SelectItem value='CUOTA_VENCIMIENTO'>
                      Cuota al vencimiento
                    </SelectItem>
                    <SelectItem value='CUOTA_VARIABLE'>
                      Cuota variable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='col-span-2'>
                <Label htmlFor='reason'>Motivo</Label>
                <Textarea
                  id='reason'
                  name='reason'
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              {/* Guarantee fields - only show if validation fails */}
              {memberValidation.exceedsLimit && (
                <>
                  <div className='space-y-2'>
                    <Label>Tipo de Garantía</Label>
                    <Select
                      value={formData.guaranteeType}
                      onValueChange={(value: GuaranteeType) =>
                        updateFormData({
                          guaranteeType: value,
                          guaranteeDetail: '',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar tipo de garantía' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='AVAL'>Aval</SelectItem>
                        <SelectItem value='INMUEBLE'>Inmueble</SelectItem>
                        <SelectItem value='HIPOTECARIA'>Hipotecaria</SelectItem>
                        <SelectItem value='PRENDARIA'>Prendaria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label>Garantía</Label>
                    {formData.guaranteeType === 'AVAL' ? (
                      <Select
                        value={formData.guaranteeDetail}
                        onValueChange={(value) =>
                          updateFormData({ guaranteeDetail: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar aval' />
                        </SelectTrigger>
                        <SelectContent>
                          {members
                            .filter((member) => member.id !== formData.memberId)
                            .map((member) => (
                              <SelectItem
                                key={member.id}
                                value={member.id}
                              >
                                {member.full_name || member.username}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        name='guaranteeDetail'
                        value={formData.guaranteeDetail}
                        onChange={handleInputChange}
                        placeholder='Detalles de la garantía'
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Form Purchase */}
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='formPurchased'
                checked={formData.formPurchased}
                onCheckedChange={(checked) =>
                  updateFormData({
                    formPurchased: !!checked,
                    formCost: loanFormValue,
                  })
                }
              />
              <Label htmlFor='formPurchased'>
                Compró formulario S/ {loanFormValue}
              </Label>
            </div>

            <Button
              type='submit'
              className='w-full md:w-auto'
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrar Préstamo'}
            </Button>
          </form>
        </CardContent>
      </Card>

     
    </div>
  );
};

export default SolicitudPrestamo;