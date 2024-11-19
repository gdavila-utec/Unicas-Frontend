'use client';

import { useParams } from 'next/navigation';
import AsambleaSection from '@/components/AssemblySection';

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <AsambleaSection juntaId={juntaId} />;
}
