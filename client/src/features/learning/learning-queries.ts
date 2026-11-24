import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';
import { learningApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { CourseProgress, MyCourse } from '@/types/api';

export const useProgress = (courseId: string): UseQueryResult<CourseProgress> =>
  useQuery({ queryKey: queryKeys.progress(courseId), queryFn: () => learningApi.progress(courseId) });

export const useMyCourses = (): UseQueryResult<MyCourse[]> =>
  useQuery({ queryKey: queryKeys.myCourses, queryFn: learningApi.myCourses });

/** Progress mutations return the new progress, so the cache is updated directly instead of refetched. */
function useProgressMutation<TVariables>(
  courseId: string,
  mutationFn: (variables: TVariables) => Promise<CourseProgress>
): UseMutationResult<CourseProgress, Error, TVariables> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: progress => {
      queryClient.setQueryData(queryKeys.progress(courseId), progress);
      void queryClient.invalidateQueries({ queryKey: queryKeys.myCourses });
    }
  });
}

export const useEnroll = (courseId: string): UseMutationResult<CourseProgress, Error, void> =>
  useProgressMutation(courseId, () => learningApi.enroll(courseId));

export const useCompleteLesson = (courseId: string): UseMutationResult<CourseProgress, Error, string> =>
  useProgressMutation(courseId, (lessonId: string) => learningApi.completeLesson(courseId, lessonId));
