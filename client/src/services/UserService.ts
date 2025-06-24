import axiosInstance from '../config/axios';
import { ApiResponse, User } from '../types/types';

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get<User[]>('/users');
    console.log('API response for getAllUsers:', response.data); 
    return response.data || [];
  } catch (error: any) {
    console.error('Error in getAllUsers:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách người dùng');
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    console.log('API response for getUserById:', response.data); 
    return response.data || null;
  } catch (error: any) {
    console.error('Error in getUserById:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
};

export const createUser = async (user: {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  avatar?: string;
}): Promise<number> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ userId: number }>>('/users', user);
    return response.data.data?.userId || 0;
  } catch (error) {
    throw new Error('Không thể tạo người dùng');
  }
};

export const updateUser = async (
  id: number,
  user: {
    email?: string;
    password?: string;
    full_name?: string;
    role?: string;
    avatar?: string;
    is_active?: boolean; 
  }
): Promise<void> => {
  try {
    console.log('Sending updateUser request:', { id, user });
    const response = await axiosInstance.put(`/users/${id}`, user);
    console.log('updateUser response:', response.data);
  } catch (error: any) {
    console.error('Error in updateUser:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật người dùng');
  }
};

export const updateAvatar = async (id: number, avatarFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile); 

    const response = await axiosInstance.patch<ApiResponse<{ avatar: string }>>(
      `/users/${id}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data?.avatar || '';
  } catch (error) {
    throw new Error('Không thể cập nhật avatar');
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/users/${id}`);
  } catch (error) {
    throw new Error('Không thể xóa người dùng');
  }
};

export const verifyEmail = async (id: number, verification_token: string): Promise<void> => {
  try {
    await axiosInstance.post('/users/verify-email', { id, verification_token });
  } catch (error) {
    throw new Error('Xác minh email thất bại');
  }
};