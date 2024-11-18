import React, { useState } from 'react';
import {
  UserCircle,
  ClipboardList,
  AlertCircle,
  DollarSign,
  FileText,
  Calculator,
  Building2,
  PlusCircle,
  FileSpreadsheet,
  Users,
  Menu,
  X,
} from 'lucide-react';

interface HamburgerMenuProps {
  id: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ id }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: 'Resumen',
      icon: UserCircle,
      route: `/juntas/${id}`,
      color: 'bg-[#7371FC]',
    },
    {
      label: 'Socios',
      icon: UserCircle,
      route: `/socios`,
      color: 'bg-[#4CAF50]',
    },
    {
      label: 'Asistencia',
      icon: ClipboardList,
      route: `/asistencia`,
      color: 'bg-[#FFC107]',
    },
    {
      label: 'Multas',
      icon: AlertCircle,
      route: `/multas`,
      color: 'bg-[#FF5252]',
    },
    {
      label: 'Compra de Acciones',
      icon: DollarSign,
      route: `/acciones`,
      color: 'bg-[#9C27B0]',
    },
    {
      label: 'Pago de Prestamos',
      icon: FileText,
      route: `/pagos`,
      color: 'bg-[#009688]',
    },
    {
      label: 'Registrar Prestamo',
      icon: Calculator,
      route: `/prestamos`,
      color: 'bg-[#7371FC]',
    },
    {
      label: 'Utilidades',
      icon: Building2,
      route: `/utilidades`,
      color: 'bg-[#8BC34A]',
    },
    {
      label: 'Gastos Administrativos',
      icon: PlusCircle,
      route: `/gastos`,
      color: 'bg-[#FF9800]',
    },
    {
      label: 'Otros Ingresos',
      icon: FileSpreadsheet,
      route: `/ingresos`,
      color: 'bg-[#78909C]',
    },
    {
      label: 'Actas y Asambleas',
      icon: Users,
      route: `/actas`,
      color: 'bg-[#E91E63]',
    },
  ];
  return (
    <div className='relative'>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='p-2 text-gray-300 hover:text-gray-800 focus:outline-none'
        aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
      >
        {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full left-0 w-64  rounded-md transform transition-all duration-300 ease-in-out origin-top z-50 ${
          isOpen
            ? 'opacity-100 scale-y-100'
            : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className='py-2 max-h-[calc(100vh-100px)] overflow-y-auto'>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <a
                key={index}
                href={item.route}
                className={`flex items-center gap-1 mx-2 px-4 py-2 rounded transition-all hover:scale-[1.02] ${item.color} text-white mb-1`}
                onClick={() => setIsOpen(false)}
              >
                <IconComponent className='w-5 h-5' />
                <span className='font-medium'>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Overlay for closing menu when clicking outside */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default HamburgerMenu;