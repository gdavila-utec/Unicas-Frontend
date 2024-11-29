'use client';

import { useParams } from 'next/navigation';
import MemberProfile from '@/components/MemberProfile';

export default function MemberPage() {
  const { id: juntaId, socioId } = useParams<{ socioId: string, id:string }>();



  return (
    <MemberProfile
      memberId={socioId}
      juntaId={juntaId}
    />
  );

}
