'use client';

import { useParams } from 'next/navigation';
import CapitalSocialSection from '@/components/CapitalSocialSection';

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <CapitalSocialSection juntaId={juntaId} />;
}
