import axiosInstance from '../config/axios';
import { ApiResponse, Lesson, Video, Material } from '../types/types';

export const getLessonsByCourse = async (courseId: number): Promise<Lesson[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Lesson[]>>(`/courses/${courseId}/lessons`);
    return response.data.data || [];
  } catch (error) {
    throw new Error('Failed to fetch lessons');
  }
};

export const getLessonDetails = async (lessonId: number): Promise<Lesson | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Lesson>>(`/lessons/${lessonId}`);
    return response.data.data || null;
  } catch (error) {
    throw new Error('Failed to fetch lesson details');
  }
};

export const createLesson = async (
  courseId: number,
  lesson: { title: string; description?: string; order_number?: number }
): Promise<number> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ lessonId: number }>>(
      `/courses/${courseId}/lessons`,
      lesson
    );
    return response.data.data?.lessonId || 0;
  } catch (error) {
    throw new Error('Failed to create lesson');
  }
};

export const updateLesson = async (
  lessonId: number,
  lesson: { title?: string; description?: string; order_number?: number }
): Promise<void> => {
  try {
    await axiosInstance.put(`/lessons/${lessonId}`, lesson);
  } catch (error) {
    throw new Error('Failed to update lesson');
  }
};

export const deleteLesson = async (lessonId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/lessons/${lessonId}`);
  } catch (error) {
    throw new Error('Failed to delete lesson');
  }
};

export const addVideo = async (
  lessonId: number,
  video: {
    title: string;
    description?: string;
    video_url: string;
    order_number?: number;
    duration?: number;
    is_preview?: boolean;
  }
): Promise<number> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ videoId: number }>>(
      `/lessons/${lessonId}/videos`,
      video,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data?.videoId || 0;
  } catch (error) {
    throw new Error('Failed to add video');
  }
};

export const updateVideo = async (
  videoId: number,
  video: {
    title?: string;
    description?: string;
    video_url?: string;
    order_number?: number;
    duration?: number;
    is_preview?: boolean;
  }
): Promise<void> => {
  try {
    await axiosInstance.put(`/videos/${videoId}`, video, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    throw new Error('Failed to update video');
  }
};

export const deleteVideo = async (videoId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/videos/${videoId}`);
  } catch (error) {
    throw new Error('Failed to delete video');
  }
};

export const addMaterial = async (
  lessonId: number,
  material: { title: string; file_url: string; file_type: string }
): Promise<number> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ materialId: number }>>(
      `/lessons/${lessonId}/materials`,
      material,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data?.materialId || 0;
  } catch (error) {
    throw new Error('Failed to add material');
  }
};

export const updateMaterial = async (
  materialId: number,
  material: { title?: string; file_url?: string; file_type?: string }
): Promise<void> => {
  try {
    await axiosInstance.put(`/materials/${materialId}`, material, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    throw new Error('Failed to update material');
  }
};

export const deleteMaterial = async (materialId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/materials/${materialId}`);
  } catch (error) {
    throw new Error('Failed to delete material');
  }
};