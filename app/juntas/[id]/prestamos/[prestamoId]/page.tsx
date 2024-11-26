// app/prestamo/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import PrestamoDetails from '@/components/PrestamoDetails';

export default function PrestamoPage() {
  const params = useParams();
  console.log('PrestamoDetails params: ', params);
  const id = params.prestamoId as string;
  return <PrestamoDetails id={id} />;
}
