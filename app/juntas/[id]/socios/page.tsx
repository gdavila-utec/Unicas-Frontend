'use client';

import { useParams } from 'next/navigation';
import MembersSection from '@/components/MembersSection';

export default function ResumenPage() {
  const params = useParams<{ id: string; }>();
  const juntaId = params.id as string;

// return <MemberProfile juntaId={juntaId} />;
  return <MembersSection juntaId={juntaId}  />;
}