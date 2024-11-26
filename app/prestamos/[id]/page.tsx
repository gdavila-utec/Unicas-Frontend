// app/prestamo/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import PrestamoDetails  from '@/components/PrestamoDetails';

export default function PrestamoPage() {
  const params = useParams();
  console.log("params: ", params);
  const id = params.id as string;
  return (
    <div className='container mx-auto p-4 bg-white w-screen h-screen'>
      <PrestamoDetails id={id} />
    </div>
  );
}
