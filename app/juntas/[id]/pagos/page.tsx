'use client';

import { useParams } from 'next/navigation';
import PagosSection from '@/components/PagosSection';

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <PagosSection juntaId={juntaId} />;
}
