import React, { useEffect, useState } from 'react';
import { getUserById, updateAvatar } from '../../services/UserService';
import { User } from '../../types/types';

interface PhotoProps {
  userId: number | undefined;
}

export default function Photo({ userId }: PhotoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lấy thông tin người dùng (bao gồm avatar)
  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        if (userData && userData.avatar) {
          setUser(userData);
          setPreview(`http://localhost:3000${userData.avatar}`);
        }
      } catch (err: any) {
        setError('Không thể tải thông tin người dùng');
      }
    };
    fetchUser();
  }, [userId]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      setUser((prev) => (prev ? { ...prev, avatar: imageUrl } : null));
    }
  };

  // Xử lý lưu ảnh
  const handleSubmit = async () => {
    if (!userId || !preview) {
      setError('Vui lòng chọn ảnh để tải lên');
      return;
    }
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError('Vui lòng chọn ảnh để tải lên');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const avatarPath = await updateAvatar(userId, file);
      setSuccess('Cập nhật ảnh đại diện thành công');
      setPreview(`http://localhost:3000${avatarPath}`);
    } catch (err: any) {
      setError(err.message || 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-7xl mx-auto p-6 gap-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">Avatar</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Thêm một bức ảnh đẹp của bạn cho hồ sơ.
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

        {/* Image Preview Section */}
        <div className="border border-gray-300 rounded-md bg-gray-50 p-6 w-full max-w-lg items-center mx-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">Xem trước ảnh</p>
          <div className="w-full aspect-video border border-gray-300 bg-white flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="object-contain h-full max-h-60"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-24 h-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Upload File Section */}
        <div className="max-w-md mt-6 items-center mx-auto">
          <label className="text-base text-slate-900 font-medium mb-3 block">Tải file lên</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-slate-500 font-medium text-sm bg-white border 
              file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 
              file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-slate-500 rounded"
          />
          <p className="text-xs text-slate-500 mt-2">
            PNG, JPG, SVG, WEBP, và GIF được phép.
          </p>
          {/* Save button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}