import {
  ChevronLeft,
  Home,
  User,
  DollarSign,
  AlertTriangle,
  PiggyBank,
  CreditCard,
  Settings,
  DollarSignIcon,
  UserCircle,
  ClipboardList,
  AlertCircle,
  FileText,
  Calculator,
  Building2,
  PlusCircle,
  FileSpreadsheet,
  Users,
} from 'lucide-react';

export const MenuItems = (id:string) => {
  return  [
    {
      label: 'Resumen',
      icon: UserCircle,
      route: `/`,
      color:
        'w-fit lg:w-full justify-start bg-periwinkleBlue text-white h-9  hover:scale-105   [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90 hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Socios',
      icon: UserCircle,
      route: `/socios`,
      color:
        'w-fit lg:w-full justify-start bg-softGreen text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Asistencia',
      icon: ClipboardList,
      route: `/asistencia`,
      color:
        'w-fit lg:w-full justify-start bg-goldenYellow text-white h-9  hover:scale-105 [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Multas',
      icon: AlertCircle,
      route: `/multas`,
      color:
        'w-fit lg:w-full justify-start bg-coralRed text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Compra de Acciones',
      icon: DollarSign,
      route: `/acciones`,
      color:
        'w-fit lg:w-full justify-start bg-violetPurple text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Pago de Prestamos',
      icon: FileText,
      route: `/pagos`,
      color:
        'w-fit lg:w-full justify-start bg-teal text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Registrar Prestamo',
      icon: Calculator,
      route: `/prestamos`,
      color:
        'w-fit lg:w-full justify-start bg-periwinkleBlue text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Utilidades',
      icon: Building2,
      route: `/multistep`,
      color:
        'w-fit lg:w-full justify-start bg-limeGreen text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Gastos Administrativos',
      icon: PlusCircle,
      route: `/capital`,
      color:
        'w-fit lg:w-full justify-start bg-burntOrange text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Otros Ingresos',
      icon: FileSpreadsheet,
      route: `/agenda`,
      color:
        'w-fit lg:w-full justify-start bg-slateGray text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
    {
      label: 'Actas y Asambleas',
      icon: Users,
      route: `/asamblea`,
      color:
        'w-fit lg:w-full justify-start bg-rosePink text-white h-9  hover:scale-105  [&[data-state=active]]:text-white [&[data-state=active]]:brightness-90',
    },
  ];

}