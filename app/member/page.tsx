import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function MemberProfilePage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-gray-900 text-white p-4 flex justify-between items-center'>
        <h1 className='text-lg font-medium'>Nombre de la UNICA</h1>
        <Button
          variant='outline'
          className='text-white border-white hover:text-white'
        >
          Cerrar sesión
        </Button>
      </header>

      <main className='container mx-auto p-4 space-y-6'>
        {/* Profile Section */}
        <div className='grid md:grid-cols-3 gap-4'>
          <Card className='md:col-span-1'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserCircle className='h-6 w-6' />
                Perfil del Socio
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-gray-500'>Nombre:</p>
                <p className='font-medium'>Jose Luque</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>DNI:</p>
                <p className='font-medium'>07877790</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Celular:</p>
                <p className='font-medium'>987654321</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Cargo:</p>
                <p className='font-medium'>Presidente</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Fecha de Ingreso:</p>
                <p className='font-medium'>01/01/2020</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Actividad Productiva:</p>
                <p className='font-medium'>Agricultura</p>
              </div>
              <Button
                className='w-full'
                variant='secondary'
              >
                Ver toda la información
              </Button>
            </CardContent>
          </Card>

          <Card className='md:col-span-1'>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-4xl font-bold'>52</div>
              <div className='text-sm text-gray-500'>Valor: S/. 159</div>
            </CardContent>
          </Card>

          <Card className='md:col-span-1'>
            <CardHeader>
              <CardTitle>Utilidades Acumuladas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-4xl font-bold'>SJ.500</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Loans Section */}
        <Card>
          <CardHeader>
            <CardTitle>Prestamos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-4 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Monto solicitado</p>
                <p className='text-lg font-bold'>S/.500</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Monto adeudo</p>
                <p className='text-lg font-bold'>S/.200</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Cuotas pendientes</p>
                <p className='text-lg font-bold'>2</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Monto de proxima cuota</p>
                <p className='text-lg font-bold'>S/.100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Socios y Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Acciones</TableHead>
                  <TableHead>Valor en acciones</TableHead>
                  <TableHead>Cantidad de prestamos activos</TableHead>
                  <TableHead>Monto adeudo en prestamos</TableHead>
                  <TableHead>Utilidades Acumuladas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Jose Luque</TableCell>
                  <TableCell>52</TableCell>
                  <TableCell>S/. 159</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>S/. 0</TableCell>
                  <TableCell>S. 500</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Fausto Choque</TableCell>
                  <TableCell>16</TableCell>
                  <TableCell>S/. 160</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>S/. 0</TableCell>
                  <TableCell>S. 300</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Enov Monte Salvaje</TableCell>
                  <TableCell>120</TableCell>
                  <TableCell>S/. 1200</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>S/. 0</TableCell>
                  <TableCell>S/. 700</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Active Loans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Prestamos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Socio</TableHead>
                  <TableHead>Monto solicitado</TableHead>
                  <TableHead>Monto adeudo</TableHead>
                  <TableHead>Cuotas pendientes</TableHead>
                  <TableHead>Monto de proxima cuota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Jose Luque</TableCell>
                  <TableCell>S/.500</TableCell>
                  <TableCell>S/.200</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>S/.100</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Fausto Choque</TableCell>
                  <TableCell>S/.300</TableCell>
                  <TableCell>S/.100</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>S/.100</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Enov Monte Salvaje</TableCell>
                  <TableCell>S/.700</TableCell>
                  <TableCell>S/.300</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>S/.100</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className='flex justify-center'>
          <Button
            size='lg'
            variant='secondary'
          >
            Ver toda la información de la UNICA
          </Button>
        </div>
      </main>
    </div>
  );
}
