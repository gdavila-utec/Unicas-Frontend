'use client';

import { useParams } from 'next/navigation';
import AccionesSection from '@/components/AccionesSection';

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <AccionesSection juntaId={juntaId} />;
}
