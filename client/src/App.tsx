
import './index.css'
import Home from './pages/Home'
import Footer from './components/layout/Footer'
import CourseDetail from './pages/CourseDetail'
import MyCourses from '../src/pages/MyCourses'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import ShoppingCart from './pages/ShoppingCart'
import CheckOut from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import CoursePaid from './pages/CoursePaid'
import CourseProgress from './pages/CourseProgress'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AllCourses from './pages/AllCourses'
import ProtectedRoute from './components/common/ProtectedRoute';
import Search from './pages/Search';
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import AdminDashboard from './pages/AdminDashboard'
import AdminProtectedRoute from './components/common/AdminProtectedRoute'
function App() {


  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<AllCourses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/mycourses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player"
          element={
            <ProtectedRoute>
              <CourseProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <ShoppingCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckOut />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paid"
          element={
            <ProtectedRoute>
              <CoursePaid />
            </ProtectedRoute>
          }
        />

        {/* Trang không tìm thấy (404) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
