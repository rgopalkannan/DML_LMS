import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { certificatesApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { Certificate, Verification } from '@/types/api';

export const useMyCertificates = (): UseQueryResult<Certificate[]> =>
  useQuery({ queryKey: queryKeys.certificates, queryFn: certificatesApi.mine });

export const useVerification = (serial: string): UseQueryResult<Verification> =>
  useQuery({ queryKey: queryKeys.verification(serial), queryFn: () => certificatesApi.verify(serial) });

/** Fetches the PDF with the user's token and hands it to the browser as a download. */
export function useDownloadCertificate(): UseMutationResult<void, Error, Certificate> {
  return useMutation({
    mutationFn: async certificate => {
      const blob = await certificatesApi.pdf(certificate.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificate.serial}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  });
}
