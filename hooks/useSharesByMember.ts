import { useState, useEffect, useMemo } from 'react';
import { Accion, MemberRole } from '../types';

interface ShareInfo {
  amount: number;
  shareValue: number;
  date: string;
  type: 'COMPRA' | 'VENTA';
}

interface MemberInfo {
  fullName: string | null;
  documentNumber: string | null;
  memberRole: MemberRole | null;
  beneficiaryInfo: {
    name: string | null;
    document: string | null;
    address: string | null;
    phone: string | null;
  };
}

interface SharesByMemberData {
  memberId: string;
  memberInfo: MemberInfo;
  shares: ShareInfo[];
  totalShares: number;
  totalValue: number;
}

interface UseSharesByMemberResult {
  sharesByMember: SharesByMemberData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  totalShares: number;
  totalValue: number;
}

const useSharesByMember = (
  acciones: Accion[] | undefined
): UseSharesByMemberResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const refetch = () => setLastUpdate(Date.now());

  const { sharesByMember, totalShares, totalValue } = useMemo(() => {
    if (!acciones) {
      return { sharesByMember: [], totalShares: 0, totalValue: 0 };
    }

    try {
      const sharesByMemberMap = new Map<string, SharesByMemberData>();
      let totalSharesCount = 0;
      let totalValueCount = 0;

      acciones.forEach((accion) => {
        const member = accion.member;
        if (!member) return;

        const memberKey = member.id;
        const shareInfo: ShareInfo = {
          amount: accion.amount,
          shareValue: accion.shareValue,
          date: accion.createdAt,
          type: accion.type,
        };

        const currentValue = accion.amount * accion.shareValue;
        totalSharesCount += accion.amount;
        totalValueCount += currentValue;

        if (sharesByMemberMap.has(memberKey)) {
          const existingMember = sharesByMemberMap.get(memberKey)!;
          existingMember.shares.push(shareInfo);
          existingMember.totalShares += accion.amount;
          existingMember.totalValue += currentValue;
          sharesByMemberMap.set(memberKey, existingMember);
        } else {
          const memberInfo: MemberInfo = {
            fullName: member.full_name,
            documentNumber: member.document_number,
            memberRole: member.member_role,
            beneficiaryInfo: {
              name: member.beneficiary_full_name,
              document: member.beneficiary_document_number,
              address: member.beneficiary_address,
              phone: member.beneficiary_phone,
            },
          };

          sharesByMemberMap.set(memberKey, {
            memberId: memberKey,
            memberInfo,
            shares: [shareInfo],
            totalShares: accion.amount,
            totalValue: currentValue,
          });
        }
      });

      return {
        sharesByMember: Array.from(sharesByMemberMap.values()),
        totalShares: totalSharesCount,
        totalValue: totalValueCount,
      };
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Error processing shares data')
      );
      return { sharesByMember: [], totalShares: 0, totalValue: 0 };
    }
  }, [acciones, lastUpdate]);

  useEffect(() => {
    setIsLoading(false);
  }, [acciones]);

  return {
    sharesByMember,
    isLoading,
    error,
    refetch,
    totalShares,
    totalValue,
  };
};

export default useSharesByMember;
