'use client';

import { useParams } from 'next/navigation';
import Resumen  from '@/components/ResumenSection';
import { MenuItems } from '@/components/MenuItems';

export default function ResumenPage() {
  const params = useParams();
  const menuItems = MenuItems(params.id as string);

  return (
    <Resumen
      juntaId={params.id as string}
      menuItems={menuItems}
    />
  );
}
