'use client';

import { useParams } from 'next/navigation';
import {AssemblySteps} from '@/components/Steps';

export default function ResumenPage() {
  const params = useParams<{ id: string }>();
  const juntaId = params.id as string;

  return <AssemblySteps juntaId={juntaId} />;
}
