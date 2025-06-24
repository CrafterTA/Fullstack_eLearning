// src/services/CategoryService.ts
import axiosInstance from '../config/axios';
import { Category } from '../types/types';

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosInstance.get<Category[]>('/categories');
    console.log('API response for getAllCategories:', response.data); // Log dữ liệu
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching categories:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách danh mục');
  }
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  try {
    const response = await axiosInstance.get<Category>(`/categories/${id}`);
    console.log('API response for getCategoryById:', response.data);
    return response.data || null;
  } catch (error: any) {
    console.error('Error in getCategoryById:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin danh mục');
  }
};

export const createCategory = async (name: string, description?: string): Promise<number> => {
  try {
    const response = await axiosInstance.post<{ categoryId: number }>('/categories', {
      name,
      description,
    });
    console.log('createCategory response:', response.data);
    return response.data.categoryId || 0;
  } catch (error: any) {
    console.error('Error in createCategory:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tạo danh mục');
  }
};

export const updateCategory = async (id: number, name: string, description?: string): Promise<void> => {
  try {
    console.log('Sending updateCategory request:', { id, name, description });
    const response = await axiosInstance.put(`/categories/${id}`, { name, description });
    console.log('updateCategory response:', response.data);
  } catch (error: any) {
    console.error('Error in updateCategory:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật danh mục');
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    console.log('Sending deleteCategory request:', { id });
    const response = await axiosInstance.delete(`/categories/${id}`);
    console.log('deleteCategory response:', response.data);
  } catch (error: any) {
    console.error('Error in deleteCategory:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể xóa danh mục');
  }
};