import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PrestamoDetails {
  id: string;
  loan_code: string;
  juntaId: string;
  member: {
    document_number: string;
    full_name: string;
  };
  loan_type: string;
  amount: number;
  request_date: string;
  monthly_interest: number;
  number_of_installments: number;
  payment_type: string;
  remaining_amount: number;
  paymentSchedule: Array<{
    id: string;
    installment_number: number;
    due_date: string;
    expected_amount: number;
    paid_amount: number;
    principal: number;
    interest: number;
    status: 'PENDING' | 'PAID';
    remaining_balance: number;
  }>;
}

interface LoanStatus {
  totalPaid: number;
  remainingAmount: number;
  remainingPayments: Array<{
    id: string;
    installment_number: number;
    due_date: string;
    expected_amount: number;
    paid_amount: number;
    principal: number;
    interest: number;
    status: 'PENDING' | 'PAID';
    remaining_balance: number;
  }>;
  nextPaymentDue: number | null;
  nextPaymentDate: string | null;
  isOverdue: boolean;
}

interface UsePrestamoDetailsResult {
  prestamo: PrestamoDetails | null;
  loanStatus: LoanStatus | null;
  isLoading: boolean;
  error: Error | null;
  juntaId: string | null;
  getTotalInterest: () => number;
  getTotalPrincipal: () => number;
  formatMoney: (amount: number) => string;
  formatDate: (date: string) => string;
  exportToPDF: () => void;
}

export const usePrestamoDetails = (id: string): UsePrestamoDetailsResult => {
  const {
    data: prestamo,
    isLoading,
    error,
  } = useQuery<PrestamoDetails>({
    queryKey: ['prestamo', id],
    queryFn: async () => {
      const response = await api.get(`prestamos/${id}`);
      return response;
    },
  });

  const {
    data: loanStatus,
    // isLoading: isLoadingLoanStatus,
    // error: loanStatusError,
  } = useQuery<LoanStatus>({
    queryKey: ['loan-status', id],
    queryFn: async () => {
      const response = await api.get(`prestamos/${id}/remaining-payments`);
      return response;
    },
    enabled: !!id,
    staleTime: 0,
  });

  const getTotalInterest = () => {
    if (!prestamo?.paymentSchedule) return 0;
    return prestamo.paymentSchedule.reduce(
      (sum, schedule) => sum + schedule.interest,
      0
    );
  };

  const getTotalPrincipal = () => {
    if (!prestamo?.paymentSchedule) return 0;
    return prestamo.paymentSchedule.reduce(
      (sum, schedule) => sum + schedule.principal,
      0
    );
  };

  const formatMoney = (amount: number) => {
    return `S/. ${amount?.toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMMM yyyy', { locale: es });
  };

  const exportToPDF = () => {
    if (!prestamo) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Add title
    doc.setFontSize(20);
    doc.text('Detalle del Préstamo', pageWidth / 2, 15, { align: 'center' });

    // Add client info
    doc.setFontSize(12);
    doc.text(
      `Cliente: ${prestamo.member.document_number} - ${prestamo.member.full_name}`,
      15,
      25
    );

    // Add loan details
    const loanDetails = [
      ['Forma de pago', prestamo.payment_type],
      ['Tipo', prestamo.loan_type],
      ['Código', prestamo.loan_code],
      ['Fecha otorgo', formatDate(prestamo.request_date)],
      ['Monto', formatMoney(prestamo.amount)],
      ['Plazo', `${prestamo.number_of_installments} Meses`],
      ['Interés Mensual', `${prestamo.monthly_interest}%`],
    ];

    // First table for loan details
    autoTable(doc, {
      head: [['Detalle', 'Valor']],
      body: loanDetails,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
    });

    // Get the Y position after the first table
    const firstTableHeight = (doc as any).lastAutoTable.finalY;

    // Add payment schedule
    const scheduleData = prestamo.paymentSchedule.map((schedule) => [
      schedule.installment_number,
      formatDate(schedule.due_date),
      formatMoney(schedule.interest),
      formatMoney(schedule.principal),
      formatMoney(schedule.expected_amount),
      formatMoney(schedule.remaining_balance),
      schedule.status === 'PAID' ? 'Pagado' : 'Pendiente',
    ]);

    // Add totals row
    scheduleData.push([
      'Totales',
      '',
      formatMoney(getTotalInterest()),
      formatMoney(getTotalPrincipal()),
      formatMoney(getTotalInterest() + getTotalPrincipal()),
      '',
      '',
    ]);

    // Second table for payment schedule
    autoTable(doc, {
      head: [
        [
          'N°',
          'Fecha',
          'Intereses',
          'Amortización',
          'Cuota',
          'Saldo',
          'Estado',
        ],
      ],
      body: scheduleData,
      startY: firstTableHeight + 10,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
      footStyles: { fontStyle: 'bold' },
      styles: { fontSize: 8 }, // Smaller font size for the schedule table
      columnStyles: {
        0: { cellWidth: 10 }, // N°
        1: { cellWidth: 25 }, // Fecha
        2: { cellWidth: 20 }, // Intereses
        3: { cellWidth: 25 }, // Amortización
        4: { cellWidth: 20 }, // Cuota
        5: { cellWidth: 20 }, // Saldo
        6: { cellWidth: 20 }, // Estado
      },
    });

    // Add footer with generation date
    const date = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
    doc.setFontSize(10);
    doc.text(`Generado el: ${date}`, 15, doc.internal.pageSize.height - 10);

    // Save the PDF
    doc.save(`prestamo-${prestamo.loan_code}.pdf`);
  };

  return {
    prestamo: prestamo ?? null,
    loanStatus: loanStatus ?? null,
    juntaId: prestamo?.juntaId || null,
    isLoading,
    error: error as Error | null,
    getTotalInterest,
    getTotalPrincipal,
    formatMoney,
    formatDate,
    exportToPDF,
  };
};
