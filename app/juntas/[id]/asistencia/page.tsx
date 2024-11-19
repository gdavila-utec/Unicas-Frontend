'use client';

import { useParams } from 'next/navigation';
import { AsistenciaSection } from '@/components/Asistencia';

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <AsistenciaSection juntaId={juntaId} />;
}
