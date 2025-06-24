import axiosInstance from '../config/axios';
import { ApiResponse, Course, Lesson, User } from '../types/types';
import { getUserEnrollments } from '../services/EnrollmentService';

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const response = await axiosInstance.get<Course[]>('http://localhost:3000/api/courses');
    console.log('API Response:', response.data);
    const coursesData = Array.isArray(response.data) ? response.data : [];
    return coursesData;
  } catch (error: any) {
    console.error('Error fetching courses:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error('Failed to fetch courses: ' + (error.response?.data?.message || error.message));
  }
};

export const getCourseById = async (id: number): Promise<Course | null> => {
  try {
    console.log(`getCourseById called with id: ${id}, Type: ${typeof id}`);
    if (isNaN(id)) {
      throw new Error('ID không hợp lệ');
    }
    const response = await axiosInstance.get(`/courses/${id}`);
    const data = response.data;
    if (data) {
      if (data.success !== undefined) {
        return data.success && data.data ? data.data : null;
      }
      return data || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching course with id ${id}:`, error);
    throw error;
  }
};

export const getCourseDetails = async (id: number): Promise<Course | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Course>>(`/courses/${id}/details`);
    return response.data.data || null;
  } catch (error) {
    throw new Error('Failed to fetch course details');
  }
};

export const getLessonsByCourse = async (courseId: number): Promise<Lesson[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Lesson[]>>(`/courses/${courseId}/lessons`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw new Error('Failed to fetch lessons');
  }
};

export const createCourse = async (course: FormData): Promise<number> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ courseId: number }>>('/courses', course, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data?.courseId || 0;
  } catch (error: any) {
    console.error('Lỗi khi tạo khóa học:', error.message, error.response?.data);
    throw new Error(error.response?.data?.message || 'Không thể tạo khóa học');
  }
};

export const updateCourse = async (id: number, course: FormData): Promise<void> => {
  try {
    if (isNaN(id)) {
      throw new Error('ID khóa học không hợp lệ');
    }
    console.log(`Cập nhật khóa học với ID: ${id}, Dữ liệu:`, Object.fromEntries(course));
    await axiosInstance.put(`/courses/${id}`, course, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error: any) {
    console.error(`Lỗi khi cập nhật khóa học ID ${id}:`, error.message, error.response?.data);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật khóa học');
  }
};
export const deleteCourse = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/courses/${id}`);
  } catch (error) {
    throw new Error('Failed to delete course');
  }
};

export const getUsersByCourse = async (courseId: number): Promise<User[]> => {
  try {
    const enrollments = await getUserEnrollments();
    const courseEnrollments = enrollments.filter((enrollment) => enrollment.course_id === courseId);
    const userPromises = courseEnrollments.map((enrollment) =>
      axiosInstance.get<ApiResponse<User>>(`/users/${enrollment.user_id}`)
    );
    const userResponses = await Promise.all(userPromises);
    return userResponses
      .map((res) => res.data.data)
      .filter((user): user is User => !!user);
  } catch (error: any) {
    console.error('Error fetching users for course:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error('Failed to fetch users: ' + (error.response?.data?.message || error.message));
  }
};