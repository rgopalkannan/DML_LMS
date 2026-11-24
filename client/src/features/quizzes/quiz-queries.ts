import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { quizzesApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { Answer, AttemptResult, QuizDraw } from '@/types/api';

/** Drawing is a mutation: each call returns a different set of questions and must not be cached or retried. */
export const useDrawQuiz = (courseId: string): UseMutationResult<QuizDraw, Error, void> =>
  useMutation({ mutationFn: () => quizzesApi.draw(courseId) });

export function useSubmitQuiz(
  courseId: string
): UseMutationResult<AttemptResult, Error, { drawToken: string; idempotencyKey: string; answers: Answer[] }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: body => quizzesApi.submit(courseId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.progress(courseId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myCourses });
      void queryClient.invalidateQueries({ queryKey: queryKeys.certificates });
    }
  });
}
