import React, { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import { getPayments, updatePaymentStatus } from '../../services/PaymentService';
import { Payment } from '../../types/types';

function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

export default function AdPay() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Success' | 'Failed'>('Pending');
  const [showModal, setShowModal] = useState(false);

  // Fetch payments on component mount
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPayments();
        setPayments(data);
        setFilteredPayments(data);
      } catch (error: any) {
        setError(error.message || 'Không thể tải danh sách thanh toán');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Filter payments based on search query
  useEffect(() => {
    const filtered = payments.filter(
      (payment) =>
        payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.user_id.toString().includes(searchQuery)
    );
    setFilteredPayments(filtered);
  }, [searchQuery, payments]);

  // Handle status update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPaymentId) return;
    setLoading(true);
    setError(null);
    try {
      await updatePaymentStatus(editPaymentId, newStatus);
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === editPaymentId ? { ...payment, status: newStatus } : payment
        )
      );
      setShowModal(false);
      setEditPaymentId(null);
      setNewStatus('Pending');
    } catch (error: any) {
      setError(error.message || 'Không thể cập nhật trạng thái thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Render modal for updating payment status
  const renderModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
    >
      <form
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative transform transition-all scale-100 hover:scale-[1.01]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleUpdateStatus}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 group"
          onClick={() => setShowModal(false)}
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Cập nhật trạng thái thanh toán</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="space-y-6">
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as 'Pending' | 'Success' | 'Failed')}
              required
            >
              <option value="Pending">Đang chờ</option>
              <option value="Success">Thành công</option>
              <option value="Failed">Thất bại</option>
            </select>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              onClick={() => setShowModal(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu trạng thái'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Payment Management</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800 placeholder-gray-400"
            placeholder="Tìm kiếm theo mã giao dịch hoặc ID người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>
      <div className="w-full flex-grow p-6">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-600">Đang tải...</p>
        ) : filteredPayments.length === 0 ? (
          <p className="text-center text-gray-600">Không tìm thấy thanh toán</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold">ID</th>
                  <th className="p-4 text-left text-sm font-semibold">Ngày thanh toán</th>
                  <th className="p-4 text-left text-sm font-semibold">Người dùng</th>
                  <th className="p-4 text-left text-sm font-semibold">Tổng tiền</th>
                  <th className="p-4 text-left text-sm font-semibold">Phương thức</th>
                  <th className="p-4 text-left text-sm font-semibold">Mã giao dịch</th>
                  <th className="p-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="p-4 text-left text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment, idx) => (
                  <tr
                    key={payment.id}
                    className={`${idx % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-all duration-200`}
                  >
                    <td className="p-4 text-[15px] text-gray-900 font-medium">{payment.id}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">{payment.user_id}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">{payment.payment_method}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">
                      {payment.transaction_id || 'N/A'}
                    </td>
                    <td className="p-4 text-[15px]">
                      <span
                        className={
                          payment.status === 'Success'
                            ? 'text-green-600 font-semibold'
                            : payment.status === 'Pending'
                            ? 'text-yellow-600 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {payment.status === 'Success' ? 'Thành công' : payment.status === 'Pending' ? 'Đang chờ' : 'Thất bại'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                        title="Chỉnh sửa trạng thái"
                        onClick={() => {
                          setEditPaymentId(payment.id);
                          setNewStatus(payment.status);
                          setShowModal(true);
                        }}
                        disabled={loading}
                      >
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && renderModal()}
    </div>
  );
}