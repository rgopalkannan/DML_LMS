import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';
import { usersApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { LIMITS } from '@/constants/labels';
import type { NewUserInput, Page, Role, User } from '@/types/api';

export const useUsers = (page: number, search: string): UseQueryResult<Page<User>> =>
  useQuery({
    queryKey: queryKeys.users(page, search),
    queryFn: () => usersApi.list(page, LIMITS.USERS_PAGE_SIZE, search),
    placeholderData: keepPreviousData
  });

export function useCreateUser(): UseMutationResult<User, Error, NewUserInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.usersRoot })
  });
}

export function useUpdateUser(): UseMutationResult<
  User,
  Error,
  { userId: string; changes: { role?: Role; isActive?: boolean } }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, changes }) => usersApi.update(userId, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.usersRoot })
  });
}
