import React, { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getReviewsByCourse, approveReview } from '../../services/ReviewService';
import { Review } from '../../types/types';

export default function AdReview() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);
  const [newApprovalStatus, setNewApprovalStatus] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);

 
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReviewsByCourse(0); 
        setReviews(data);
        setFilteredReviews(data);
      } catch (error: any) {
        setError(error.message || 'Không thể tải danh sách đánh giá');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Filter reviews based on search query
  useEffect(() => {
    const filtered = reviews.filter(
      (review) =>
        review.course_id.toString().includes(searchQuery) ||
        review.user_id.toString().includes(searchQuery) ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredReviews(filtered);
  }, [searchQuery, reviews]);

  // Handle approval status update
  const handleUpdateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReviewId) return;
    setLoading(true);
    setError(null);
    try {
      await approveReview(editReviewId);
      setReviews((prev) =>
        prev.map((review) =>
          review.id === editReviewId ? { ...review, is_approved: newApprovalStatus } : review
        )
      );
      toast.success('Cập nhật trạng thái phê duyệt thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setShowModal(false);
      setEditReviewId(null);
      setNewApprovalStatus(false);
    } catch (error: any) {
      setError(error.message || 'Không thể cập nhật trạng thái phê duyệt');
      toast.error(error.message || 'Không thể cập nhật trạng thái phê duyệt', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

 
  const renderModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
    >
      <form
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative transform transition-all scale-100 hover:scale-[1.01]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleUpdateApproval}
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
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Cập nhật trạng thái phê duyệt</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="space-y-6">
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Trạng thái phê duyệt <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800"
              value={newApprovalStatus ? 'true' : 'false'}
              onChange={(e) => setNewApprovalStatus(e.target.value === 'true')}
              required
            >
              <option value="true">Đã phê duyệt</option>
              <option value="false">Chưa phê duyệt</option>
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
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Review Management</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800 placeholder-gray-400"
            placeholder="Tìm kiếm theo khóa học hoặc ID người dùng..."
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
        ) : filteredReviews.length === 0 ? (
          <p className="text-center text-gray-600">Không tìm thấy đánh giá</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold">ID</th>
                  <th className="p-4 text-left text-sm font-semibold">Khóa học</th>
                  <th className="p-4 text-left text-sm font-semibold">Người dùng</th>
                  <th className="p-4 text-left text-sm font-semibold">Điểm số</th>
                  <th className="p-4 text-left text-sm font-semibold">Bình luận</th>
                  <th className="p-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="p-4 text-left text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReviews.map((review, idx) => (
                  <tr
                    key={review.id}
                    className={`${idx % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-all duration-200`}
                  >
                    <td className="p-4 text-[15px] text-gray-900 font-medium">{review.id}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">{review.course_id}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">{review.user_id}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">{review.rating}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">
                      {review.comment || 'N/A'}
                    </td>
                    <td className="p-4 text-[15px]">
                      <span
                        className={
                          review.is_approved
                            ? 'text-green-600 font-semibold'
                            : 'text-yellow-600 font-semibold'
                        }
                      >
                        {review.is_approved ? 'Đã phê duyệt' : 'Chưa phê duyệt'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                        title="Chỉnh sửa trạng thái phê duyệt"
                        onClick={() => {
                          setEditReviewId(review.id);
                          setNewApprovalStatus(review.is_approved);
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