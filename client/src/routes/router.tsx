import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTE_PATTERNS, ROUTES } from '@/constants/routes';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { CertificatesPage } from '@/features/certificates/CertificatesPage';
import { VerifyPage } from '@/features/certificates/VerifyPage';
import { CatalogPage } from '@/features/courses/CatalogPage';
import { ManageCoursesPage } from '@/features/courses/admin/ManageCoursesPage';
import { HomePage } from '@/features/home/HomePage';
import { CourseOverviewPage } from '@/features/learning/CourseOverviewPage';
import { LessonPage } from '@/features/learning/LessonPage';
import { MyLearningPage } from '@/features/learning/MyLearningPage';
import { QuizPage } from '@/features/quizzes/QuizPage';
import { UsersPage } from '@/features/users/UsersPage';

export const routes: RouteObject[] = [
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTE_PATTERNS.verify, element: <VerifyPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.home, element: <HomePage /> },
          { path: ROUTES.catalog, element: <CatalogPage /> },
          { path: ROUTE_PATTERNS.course, element: <CourseOverviewPage /> },
          { path: ROUTE_PATTERNS.lesson, element: <LessonPage /> },
          { path: ROUTE_PATTERNS.quiz, element: <QuizPage /> },
          { path: ROUTES.myLearning, element: <MyLearningPage /> },
          { path: ROUTES.certificates, element: <CertificatesPage /> },
          {
            element: <RequireAuth roles={['ADMIN', 'INSTRUCTOR']} />,
            children: [{ path: ROUTES.adminCourses, element: <ManageCoursesPage /> }]
          },
          {
            element: <RequireAuth roles={['ADMIN']} />,
            children: [{ path: ROUTES.adminUsers, element: <UsersPage /> }]
          },
          {
            path: '*',
            element: <EmptyState title="Page not found" description="Check the address, or use the menu." />
          }
        ]
      }
    ]
  }
];

export const createRouter = (): ReturnType<typeof createBrowserRouter> => createBrowserRouter(routes);
