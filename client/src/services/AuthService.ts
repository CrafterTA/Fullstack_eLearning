// src/services/AuthService.tsx
import axiosInstance from '../config/axios';
import { ApiResponse, LoginResponse } from '../types/types';
import { auth, googleProvider, signInWithPopup } from '../config/firebase';
import { authEventEmitter } from '../context/AuthContext';

export const register = async (fullName: string, email: string, password: string) => {
  const response = await axiosInstance.post('/auth/register', {
    full_name: fullName,
    email,
    password,
  });
  return response.data;
};

export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await axiosInstance.get(`/auth/verify-email/${token}`);
  } catch (error) {
    throw new Error('Xác minh email thất bại');
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      authEventEmitter.emit();
      return response.data.data;
    }
    throw new Error('Đăng nhập thất bại');
  } catch (error) {
    throw new Error('Đăng nhập thất bại');
  }
};

export const googleLogin = async (): Promise<LoginResponse> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/google-login', {
      idToken,
    });
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      authEventEmitter.emit();
      return response.data.data;
    }
    throw new Error('Đăng nhập Google thất bại: Không nhận được dữ liệu từ server');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Đăng nhập Google thất bại';
    throw new Error(errorMessage);
  }
};

export const refreshToken = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('Không có refresh token');
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      authEventEmitter.emit();
    }
  } catch (error) {
    throw new Error('Làm mới token thất bại');
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await axiosInstance.post('/auth/forgot-password', { email });
  } catch (error) {
    throw new Error('Yêu cầu quên mật khẩu thất bại');
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
  } catch (error) {
    throw new Error('Đặt lại mật khẩu thất bại');
  }
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    if (refreshToken) {
      await axiosInstance.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.warn('API logout thất bại:', error);
  } finally {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      await auth.signOut();
    } catch (firebaseError) {
      console.warn('Firebase signOut thất bại:', firebaseError);
    } finally {
      authEventEmitter.emit();
    }
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    await axiosInstance.post('/auth/resend-verification', { email });
  } catch (error) {
    throw new Error('Gửi lại email xác minh thất bại');
  }
};