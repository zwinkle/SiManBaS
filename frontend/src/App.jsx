// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Import Layouts ---
// Layout ini membungkus halaman-halaman yang memerlukan autentikasi (sidebar, header, dll.)
import MainLayout from './layouts/MainLayout';
// Layout ini untuk halaman publik seperti login, biasanya lebih sederhana
import AuthLayout from './layouts/AuthLayout';

// --- Import Halaman (Pages) ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuestionListPage from './pages/QuestionListPage';
import QuestionCreatePage from './pages/QuestionCreatePage';
import QuestionEditPage from './pages/QuestionEditPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import UserManagementPage from './pages/UserManagementPage';
import StudentReportPage from './pages/StudentReportPage';
import TestSessionListPage from './pages/TestSessionListPage';
import TestSessionDetailPage from './pages/TestSessionDetailPage';
import ProfilePage from './pages/ProfilePage';
import AnalysisPage from './pages/AnalysisPage';
import NotFoundPage from './pages/NotFoundPage';

// --- Import Komponen Router ---
// Komponen ini bertindak sebagai penjaga untuk rute privat
import ProtectedRoute from './routes/ProtectedRoute';

/**
 * Komponen root aplikasi yang mendefinisikan semua routing.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
          =================================================
          Rute Publik - Untuk pengguna yang belum login
          =================================================
          Dibungkus dengan AuthLayout untuk tampilan yang sederhana dan terpusat.
        */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/*
          =================================================
          Rute Privat - Memerlukan login untuk akses
          =================================================
          Dibungkus dengan ProtectedRoute untuk memeriksa status autentikasi.
        */}
        <Route element={<ProtectedRoute />}>
          {/* Setelah lolos dari ProtectedRoute, semua halaman di dalamnya
              akan menggunakan MainLayout sebagai kerangka utama. */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/questions" element={<QuestionListPage />} />
            <Route path="/questions/create" element={<QuestionCreatePage />} />
            <Route path="/questions/edit/:id" element={<QuestionEditPage />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/students/:studentIdentifier" element={<StudentReportPage />} />
            <Route path="/sessions" element={<TestSessionListPage />} />
            <Route path="/sessions/:id" element={<TestSessionDetailPage />} />
            <Route path="/analysis/summary" element={<AnalysisPage />} />
            {/* Tambahkan rute privat lainnya di sini */}
          </Route>
        </Route>

        {/*
          =================================================
          Rute Catch-All - Untuk halaman yang tidak ditemukan
          =================================================
        */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
