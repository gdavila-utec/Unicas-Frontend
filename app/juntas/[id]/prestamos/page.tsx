'use client';

import { useParams } from 'next/navigation';
import PrestamosSection from '@/components/PrestamosSection';

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <PrestamosSection juntaId={juntaId} />;
}
