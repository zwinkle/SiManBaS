// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AppLoader from '../components/common/AppLoader';

/**
 * Komponen untuk melindungi rute.
 * Bertanggung jawab untuk memeriksa status autentikasi pengguna sebelum memberikan akses ke halaman privat.
 * * Alur Logika:
 * 1. Menampilkan loader layar penuh (`AppLoader`) saat status autentikasi sedang diverifikasi
 * pada saat pertama kali aplikasi dimuat (`loading === true`).
 * 2. Jika verifikasi selesai dan tidak ada pengguna yang login (`user === null`),
 * maka pengguna akan diarahkan ke halaman login.
 * 3. Jika verifikasi selesai dan ada pengguna yang login, maka komponen ini akan
 * menampilkan halaman yang dituju (yang dirender melalui komponen `<Outlet />`).
 */
const ProtectedRoute = () => {
    // Mengambil state autentikasi dari AuthContext melalui custom hook
    const { user, loading } = useAuth();
    // Mengambil informasi lokasi saat ini untuk redirection setelah login
    const location = useLocation();

    // Kondisi 1: Aplikasi sedang dalam proses loading (memverifikasi token).
    // Tampilkan indikator loading agar pengguna tahu ada proses yang berjalan.
    if (loading) {
        return <AppLoader tip="Memverifikasi sesi..." />;
    }

    // Kondisi 2: Proses loading selesai dan tidak ada user yang terautentikasi.
    // Arahkan (redirect) pengguna ke halaman login.
    // - `replace`: Mencegah halaman ini masuk ke riwayat browser, sehingga tombol "back" berfungsi dengan benar.
    // - `state={{ from: location }}`: Menyimpan halaman asal yang ingin diakses pengguna,
    //   agar setelah login berhasil, pengguna bisa langsung diarahkan kembali ke sana.
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Kondisi 3: Proses loading selesai dan user terautentikasi.
    // Tampilkan komponen anak (halaman privat yang sebenarnya) yang didefinisikan di dalam router.
    return <Outlet />;
};

export default ProtectedRoute;
