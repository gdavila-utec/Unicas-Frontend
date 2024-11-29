'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MemberProfilePage from '@/components/MemberProfile';

// Create a loading component
function LoadingFallback() {
  return <div>Loading member profile...</div>;
}

// Component that uses search params
function MemberContent() {
  const searchParams = useSearchParams();
  const socioId = searchParams?.get('socioId');
  const juntaId = searchParams?.get('juntaId');


  if (!socioId) {
    return <div>No member ID provided</div>;
  }

  if (!juntaId) {
    return <div>No junta ID provided</div>;
  }

  return (
    <MemberProfilePage
      memberId={Array.isArray(socioId) ? socioId[0] : socioId}
      juntaId={juntaId}
    />
  );
}

// Main page component
export default function MemberPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MemberContent />
    </Suspense>
  );
}

// Add this to prevent static generation
export const dynamic = 'force-dynamic';
