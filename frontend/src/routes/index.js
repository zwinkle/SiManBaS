// src/routes/index.js
import { createBrowserRouter } from 'react-router-dom';

// Import Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Import Halaman
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import QuestionListPage from '../pages/QuestionListPage';
import QuestionCreatePage from '../pages/QuestionCreatePage';
import QuestionDetailPage from '../pages/QuestionDetailPage';
import AnalysisPage from '../pages/AnalysisPage';
import NotFoundPage from '../pages/NotFoundPage';

// Import Komponen Rute Terproteksi
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  // Rute Publik (menggunakan AuthLayout)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  
  // Rute Privat/Terproteksi (menggunakan MainLayout di dalam ProtectedRoute)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            path: '/questions',
            element: <QuestionListPage />,
          },
          {
            path: '/questions/create',
            element: <QuestionCreatePage />,
          },
          {
            // Perlu rute untuk edit juga
            // path: '/questions/edit/:id',
            // element: <QuestionEditPage />,
          },
          {
            path: '/questions/:id',
            element: <QuestionDetailPage />,
          },
          {
            path: '/analysis/summary',
            element: <AnalysisPage />,
          },
        ]
      }
    ],
  },

  // Halaman Not Found
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
