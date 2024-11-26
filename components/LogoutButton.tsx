'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-logout'
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function LogoutButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const logout = useLogout();

  const handleLogoutClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        onClick={handleLogoutClick}
      >
        <LogOut className='h-5 w-5' />
        <span className='rounded-md bg-gray-700  font-bold text-red-500 py-2 px-3 text-xs'>Cerrar sesión</span>
      </Button>

      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro que desea cerrar sesión?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cerrará su sesión actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
