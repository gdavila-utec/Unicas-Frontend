import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MemberProfileData } from '@/z';

interface LoansCardProps {
  loans: MemberProfileData['prestamos']['activos'];
}

export function LoansCard({ loans }: LoansCardProps) {
  // Calculate total debt from all active loans
  const totalDebt = loans.reduce((sum, loan) => sum + loan.monto_adeudo, 0);

  return (
    <Card className='md:col-span-1'>
      <CardHeader>
        <CardTitle>Préstamos Activos</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 p-8'>
        {/* Number of active loans */}
        <div className='text-4xl font-bold'>{loans.length}</div>

        {/* Total debt amount */}
        <div className='text-md font-semibold gap-4 text-gray-500'>
          Total adeudado:
          <p>
            S/.{' '}
            {totalDebt.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
