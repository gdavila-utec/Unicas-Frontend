import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminSection() {
  return (
    <div className='flex flex-col space-y-4'>
      <h2 className='text-2xl font-bold'>Admin Section</h2>
      <div className='flex flex-col space-y-2'>
        <Link href='/admin'>
          <Button
            variant='outline'
            className='w-full'
          >
            User Management
          </Button>
        </Link>
      </div>
    </div>
  );
}
