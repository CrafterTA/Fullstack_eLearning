import axiosInstance from '../config/axios';
import { ApiResponse, Enrollment } from '../types/types';

export const getUserEnrollments = async (): Promise<Enrollment[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Enrollment[]>>('/enrollments');
    console.log('Phản hồi API thô:', response.data); // Log gỡ lỗi
    const enrollments = Array.isArray(response.data.data) ? response.data.data : [];
    return enrollments;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      // @ts-ignore
      console.error('Lỗi API:', (error as any).response?.data || (error as any).message); // Log gỡ lỗi
    } else {
      console.error('Lỗi API:', (error as any).message || error); // Log gỡ lỗi
    }
    return []; // Trả về mảng rỗng nếu lỗi
  }
};

export const checkEnrollment = async (courseId: number): Promise<Enrollment | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Enrollment>>(`/courses/${courseId}/enrollment`);
    return response.data.data || null;
  } catch (error) {
    throw new Error('Failed to check enrollment');
  }
};

export const deleteEnrollment = async (enrollmentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/enrollments/${enrollmentId}`);
  } catch (error) {
    throw new Error('Failed to delete enrollment');
  }
};