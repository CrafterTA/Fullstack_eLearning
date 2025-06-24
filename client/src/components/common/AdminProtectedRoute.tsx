import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAuthenticated as checkIsAuthenticated } from '../../services/AuthService'

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const authenticated = await checkIsAuthenticated();
        setIsAuth(authenticated);

        if (authenticated && user) {
          setIsAdmin(user.role === 'Admin');
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Kiểm tra xác thực thất bại:', err);
        setIsAuth(false);
        setIsAdmin(false);
        setError('Không thể xác thực. Vui lòng thử lại.');
      }
    };
    checkAuthAndRole();
  }, [user]);

  if (isAuth === null) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang kiểm tra xác thực...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;