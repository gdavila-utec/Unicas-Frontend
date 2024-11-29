import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface SharesCardProps {
  shares: {
    cantidad: number;
    valor: number;
  };
}

export function SharesCard({ shares }: SharesCardProps) {
  return (
    <Card className='md:col-span-1'>
      <CardHeader>
        <CardTitle>Acciones</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 p-8'>
        {/* Number of shares */}
        <div className='text-4xl font-bold'>{shares.cantidad}</div>

        {/* Total value */}
        <div className='text-md text-gray-500 font-semibold gap-4'>
          Valor:
          <p>
            S/.{' '}
            {shares.valor.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
