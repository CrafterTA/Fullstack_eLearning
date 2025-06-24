import React, { useEffect, useState } from 'react';
import { MdEdit } from 'react-icons/md';
import { getUserById, updateUser } from '../../services/UserService';
import { User } from '../../types/types';

interface SecurityEditProps {
  userId: number | undefined;
}

export default function SecurityEdit({ userId }: SecurityEditProps) {
  const [user, setUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateUser(userId, { password: newPassword });
      setSuccess('Đổi mật khẩu thành công');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Account</h1>
      <p className="text-sm text-gray-600 mb-6">
        Chỉnh sửa cài đặt tài khoản và thay đổi mật khẩu của bạn tại đây.
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Email */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
        <div className="relative">
          <input
            type="email"
            readOnly
            value={user?.email || 'Đang tải...'}
            className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 bg-gray-100 cursor-not-allowed"
          />
          <button
            className="absolute right-2 top-2.5 text-blue-600 hover:text-blue-800"
            disabled // Email chỉ đọc, cần API riêng để thay đổi
          >
            <MdEdit size={20} />
          </button>
        </div>
      </div>

      {/* Password */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  );
}