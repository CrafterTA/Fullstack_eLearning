import axiosInstance from '../config/axios';
import { ApiResponse, Payment } from '../types/types';

export interface PaymentStat {
  month: string;
  income: number;
  transactions: number;
}
export const getPayments = async (): Promise<Payment[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Payment[]>>('/payments');
    return response.data.data || [];
  } catch (error) {
    throw new Error('Failed to fetch payments');
  }
};

export const getPaymentById = async (paymentId: number): Promise<Payment | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
    return response.data.data || null;
  } catch (error) {
    throw new Error('Failed to fetch payment');
  }
};

export const createPayment = async (payment_method: string): Promise<number> => {
  try {
    const response = await axiosInstance.post<ApiResponse<{ paymentId: number }>>('/payments', {
      payment_method,
    });
    return response.data.data?.paymentId || 0;
  } catch (error) {
    throw new Error('Failed to create payment');
  }
};

export const updatePaymentStatus = async (
  paymentId: number,
  status: 'Pending' | 'Success' | 'Failed',
  transaction_id?: string,
  payment_date?: string
): Promise<void> => {
  try {
    await axiosInstance.patch(`/payments/${paymentId}/status`, { status, transaction_id, payment_date });
  } catch (error) {
    throw new Error('Failed to update payment status');
  }
};

export const confirmPayment = async (
  paymentId: number,
  transaction_id: string,
  status: 'Success' | 'Failed'
): Promise<void> => {
  try {
    await axiosInstance.post('/payments/confirm', { paymentId, transaction_id, status });
  } catch (error) {
    throw new Error('Failed to confirm payment');
  }
};

export const cancelPayment = async (paymentId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/payments/${paymentId}`);
  } catch (error) {
    throw new Error('Failed to cancel payment');
  }
};
export const getPaymentStats = async (): Promise<PaymentStat[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<PaymentStat[]>>('/payments/stats'); 
    console.log('API response for getPaymentStats:', response.data);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error in getPaymentStats:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể lấy thống kê thanh toán');
  }
};