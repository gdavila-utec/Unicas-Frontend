import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { AsistenciaSection } from './Asistencia';
import { AgendaInfo } from './Agenda';
import AccionesSection from './AccionesSection';
import PagosSection from './PagosSection';
import PrestamosSection from './PrestamosSection';
import SolicitudPrestamo from './SolicitudPrestamo';
import CierreActa from './CierreActa';
import  Resumen  from './ResumenSection';
import { MenuStepProps } from '@/types';

import { FC } from 'react';

// Base props that all steps will have
export interface BaseStepProps {
  juntaId: string;
}
export interface MenuItem {
  title: string;
  description: string;
}

type StepProps = BaseStepProps | MenuStepProps;

type StepComponent = FC<StepProps>;
interface Step {
  id: string;
  title: string;
  component: StepComponent;
  requiresMenu: boolean;
}



export function AssemblySteps({ juntaId }: { juntaId: string }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // const menuItems: MenuItem[] = [
  //   { title: 'Bienvenida', description: 'Bienvenida a la asamblea' },
  //   {
  //     title: 'Lectura del acta anterior',
  //     description: 'Revisión del acta previa',
  //   },
  //   { title: 'Asistencia', description: 'Toma de asistencia de socios' },
  //   { title: 'Multas', description: 'Pago de multas pendientes' },
  //   { title: 'Agenda', description: 'Revisión de agenda' },
  //   { title: 'Acciones', description: 'Compra de acciones' },
  //   { title: 'Pago de Préstamos', description: 'Registro de pagos' },
  //   { title: 'Préstamos', description: 'Registro de préstamos' },
  //   { title: 'Cierre', description: 'Cierre de acta y asamblea' },
  // ];

   const steps: Step[] = [
     {
       id: 'asistencia',
       title: 'Asistencia',
       component: AsistenciaSection,
       requiresMenu: true,
     },
     {
       id: 'agenda',
       title: 'Agenda',
       component: AgendaInfo,
       requiresMenu: true,
     },
     {
       id: 'acciones',
       title: 'Compra de acciones',
       component: AccionesSection,
       requiresMenu: true,
     },
     {
       id: 'pago-prestamos',
       title: 'Pago de préstamos',
       component: PagosSection,
       requiresMenu: true,
     },
     {
       id: 'solicitudes',
       title: 'Solicitudes de préstamos',
       component: SolicitudPrestamo,
       requiresMenu: true,
     },
     {
       id: 'registro',
       title: 'Registro de préstamos',
       component: PrestamosSection,
       requiresMenu: true,
     },
     {
       id: 'cierre',
       title: 'Cierre de Acta',
       component: CierreActa,
       requiresMenu: true,
     },
   ];

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((current) => current + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((current) => current - 1);
    }
  };

  const CurrentStepComponent = steps[currentStepIndex].component;

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      {/* Progress Steps */}
      <div className='sticky top-0 bg-white p-4 border-b z-10 shadow-sm'>
        <div className='flex justify-between items-center max-w-7xl mx-auto overflow-x-auto'>
          {steps.map((step, index) => (
            <div
              key={step.id}
              className='flex items-center shrink-0'
            >
              <div
                className={`
                  rounded-lg px-3 py-1 text-sm font-medium transition-colors
                  ${
                    index === currentStepIndex
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : index < currentStepIndex
                      ? 'bg-green-50 text-green-700 border-2 border-green-500'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 mx-2 transition-colors ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <CurrentStepComponent
              juntaId={juntaId}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='sticky bottom-0 bg-white border-t p-4 shadow-md'>
        <div className='max-w-7xl mx-auto flex justify-between'>
          <Button
            variant='outline'
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className='w-24'
          >
            Regresar
          </Button>
          <Button
            onClick={goToNextStep}
            disabled={currentStepIndex === steps.length - 1}
            className='w-24'
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
