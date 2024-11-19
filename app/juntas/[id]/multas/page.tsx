'use client';

import { useParams } from 'next/navigation';
import MultasSection from '@/components/MultasSection'

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <MultasSection juntaId={juntaId} />;
}
