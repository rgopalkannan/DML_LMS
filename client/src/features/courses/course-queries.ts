import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult
} from '@tanstack/react-query';
import { coursesApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { CourseDetail, CourseStatus, CourseSummary, NewCourseInput } from '@/types/api';

export const useCourses = (): UseQueryResult<CourseSummary[]> =>
  useQuery({ queryKey: queryKeys.courses, queryFn: coursesApi.list });

export const useCourse = (courseId: string): UseQueryResult<CourseDetail> =>
  useQuery({ queryKey: queryKeys.course(courseId), queryFn: () => coursesApi.get(courseId) });

export function useCreateCourse(): UseMutationResult<CourseSummary, Error, NewCourseInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.courses })
  });
}

export function useSetCourseStatus(): UseMutationResult<
  CourseDetail,
  Error,
  { courseId: string; status: CourseStatus }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, status }) => coursesApi.setStatus(courseId, status),
    onSuccess: (_course, { courseId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses });
      void queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
    }
  });
}
