import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

interface Member {
  id: string;
  nombre: string;
  dni: string;
  celular: string;
  cargo: string;
  fecha_ingreso: string;
  actividad_productiva: string;
  estado: string;
}

interface AccionDetalle {
  id: string;
  type: string;
  amount: number;
  shareValue: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  juntaId: string;
  memberId: string;
  affects_capital: boolean;
  agendaItemId: string | null;
  capital_movements: CapitalMovement[];
}

interface CapitalMovement {
  id: string;
  amount: number;
  type: string;
  direction: string;
  description: string;
  createdAt: string;
  juntaId: string;
  prestamoId: string | null;
  multaId: string | null;
  accionId: string | null;
  pagoId: string | null;
}

interface AccionesData {
  detalle: AccionDetalle[];
  resumen: {
    cantidad: number;
    valor: number;
  };
}

interface PrestamoActivo {
  id: string;
  monto_solicitado: number;
  monto_adeudo: number;
  cuotas_pendientes: number;
  monto_proxima_cuota: number;
  fecha_proxima_cuota: string;
  pagos_realizados: number;
  estado: string;
}

interface PrestamosData {
  activos: PrestamoActivo[];
  historial: PrestamoActivo[];
}

interface MultasData {
  pendientes: unknown[];
  historial: unknown[];
}

interface MemberProfileData {
  member: Member;
  acciones: AccionesData;
  prestamos: PrestamosData;
  multas: MultasData;
}

export function useMemberProfile(memberId: string | undefined) {
  console.log('useMemberProfile   memberId: ', memberId);
  const { data, isLoading, error } = useQuery<MemberProfileData>({
    queryKey: ['memberProfile', memberId],
    queryFn: async () => {
      if (!memberId) {
        throw new Error('Member ID is required');
      }
      const response = await api.get(`members/${memberId}`);
      console.log("response: ", response);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch member profile');
      // }
      return response;
    },
    enabled: !!memberId,
  });

  return {
    data: data
      ? {
          memberInfo: data.member,
          acciones: data.acciones.resumen,
          prestamoActivo: data.prestamos.activos[0] || null,
          prestamosActivos: data.prestamos.activos,
          prestamosHistorial: data.prestamos.historial,
          multasPendientes: data.multas.pendientes,
          multasHistorial: data.multas.historial,
          accionesDetalle: data.acciones.detalle,
        }
      : undefined,
    isLoading,
    error,
  };
}
