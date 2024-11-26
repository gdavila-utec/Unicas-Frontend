'use client';

import { useParams } from 'next/navigation';
import MemberProfile from '@/components/MemberProfile';

export default function MemberPage() {
  const params = useParams<{ socioId:string }>();
  console.log("params: ", params);
  const {  socioId } = params;


  return <MemberProfile memberId={socioId} />;

}
