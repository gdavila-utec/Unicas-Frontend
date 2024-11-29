import React from 'react';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { MemberProfileCard } from '@/components/MemberProfileCard';
import { SharesCard } from '@/components/SharesCard';
import { LoansCard } from '@/components/LoansCard';
import { ActivityHistory } from '@/components/ActivityHistory';
import Image  from 'next/image';
import logo from '@/public/logo.png';
import { useParams } from 'next/navigation';

export default function MemberProfile({ memberId, juntaId }: { memberId?: string, juntaId: string; }) {
  const { id: juntaIdAuth } = useParams();
  const juntaIdValue = Array.isArray(juntaId) ? juntaId[0] : (juntaId ? juntaId : (Array.isArray(juntaIdAuth) ? juntaIdAuth[0] : juntaIdAuth));
  const { data, isLoading, error, updateMember, formatDateForDisplay } =
    useMemberProfile(memberId, juntaIdValue);
  // console.log("updateMember: ", updateMember);
  // console.log("juntaId: ", juntaId);
  // console.log("data: ", data);
  // console.log("error: ", error);
  // console.log("isLoading: ", isLoading);
  
  if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error loading profile</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex items-center justify-center p-4 bg-[#1763b8] shadow-md'>
        <Image
          src={logo}
          alt='Unicas Logo'
          width={300}
          height={100}
        />
      </div>
      <main className='container mx-auto p-4 space-y-6'>
        <div className='grid md:grid-cols-3 gap-4'>
          <MemberProfileCard
            memberInfo={data.memberInfo}
            onUpdate={updateMember.mutate}
            formatDate={formatDateForDisplay}
          />
          <SharesCard shares={data.acciones} />
          <LoansCard loans={data.prestamosActivos} />
        </div>

        <ActivityHistory
          loans={data.prestamosActivos}
          shares={data.accionesDetalle}
          formatDate={formatDateForDisplay}
        />
      </main>
    </div>
  );
}
