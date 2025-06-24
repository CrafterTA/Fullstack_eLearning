import axiosInstance from '../config/axios';
import { ApiResponse, Review } from '../types/types';

export const getReviewsByCourse = async (courseId: number): Promise<Review[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Review[]>>(`/courses/${courseId}/reviews`);
    return response.data.data || [];
  } catch (error) {
    throw new Error('Failed to fetch reviews');
  }
};

export const getReviewById = async (reviewId: number): Promise<Review | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Review>>(`/reviews/${reviewId}`);
    return response.data.data || null;
  } catch (error) {
    throw new Error('Failed to fetch review');
  }
};

export const createReview = async (
  courseId: number,
  review: { rating: number; comment?: string }
): Promise<number> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ reviewId: number }>>(
      `/courses/${courseId}/reviews`,
      review
    );
    return response.data.data?.reviewId || 0;
  } catch (error) {
    throw new Error('Failed to create review');
  }
};

export const updateReview = async (
  reviewId: number,
  review: { rating?: number; comment?: string }
): Promise<void> => {
  try {
    await axiosInstance.put(`/reviews/${reviewId}`, review);
  } catch (error) {
    throw new Error('Failed to update review');
  }
};

export const approveReview = async (reviewId: number): Promise<void> => {
  try {
    await axiosInstance.patch(`/reviews/${reviewId}/approve`);
  } catch (error) {
    throw new Error('Failed to approve review');
  }
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  } catch (error) {
    throw new Error('Failed to delete review');
  }
};