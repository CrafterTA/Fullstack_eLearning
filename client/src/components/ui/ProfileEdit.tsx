import React, { useEffect, useState } from 'react';
import { getUserById, updateUser } from '../../services/UserService';
import { User } from '../../types/types';

interface ProfileEditProps {
  userId: number | undefined;
}

export default function ProfileEdit({ userId }: ProfileEditProps) {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        if (userData) {
          setUser(userData);
          setFullName(userData.full_name || '');
          setEmail(userData.email || '');
        }
      } catch (err: any) {
        setError('Không thể tải thông tin người dùng');
      }
    };
    fetchUser();
  }, [userId]);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Không tìm thấy ID người dùng');
      return;
    }
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedFullName) {
      setError('Họ tên không được để trống');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUser(userId, { full_name: trimmedFullName, email: trimmedEmail });
      setSuccess('Cập nhật thông tin thành công');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Cập nhật thông tin thất bại';
      setError(errorMessage);
      console.error('Lỗi cập nhật:', err.response?.data); // Log chi tiết
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Profile</h1>
      <p className="text-sm text-gray-600 mb-6">Cập nhật thông tin cá nhân của bạn</p>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập họ và tên"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập email"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
      </form>
    </div>
  );
}