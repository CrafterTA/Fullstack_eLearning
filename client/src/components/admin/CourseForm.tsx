import React from "react";
import { X } from "lucide-react";
import { Course, Category } from "../../types/types";

interface CourseFormProps {
  editCourse: Course | null;
  error: string | null;
  loading: boolean;
  courseTitle: string;
  setCourseTitle: (value: string) => void;
  courseDescription: string;
  setCourseDescription: (value: string) => void;
  categoryId: number | string;
  setCategoryId: (value: number | string) => void;
  price: string;
  setPrice: (value: string) => void;
  discountPercentage: string;
  setDiscountPercentage: (value: string) => void;
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
  thumbnailPreview: string | null;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  editCourse,
  error,
  loading,
  courseTitle,
  setCourseTitle,
  courseDescription,
  setCourseDescription,
  categoryId,
  setCategoryId,
  price,
  setPrice,
  discountPercentage,
  setDiscountPercentage,
  thumbnail,
  setThumbnail,
  thumbnailPreview,
  isActive,
  setIsActive,
  categories,
  onSubmit,
  onClose,
}) => {
  const API_URL = 'http://localhost:3000';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 mt-10 mb-10 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-100"
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 group"
          onClick={onClose}
        >
          <X className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        </button>
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          {editCourse ? "Cập nhật khóa học" : "Thêm khóa học"}
        </h2>
        {error && (
          <p className="text-red-500 text-sm mb-6 text-center bg-red-50 p-3 rounded-lg">{error}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative md:col-span-2">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              required
            />
          </div>
          <div className="relative md:col-span-2">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Mô tả
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800 placeholder-gray-400"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              rows={5}
            />
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Giá <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Phần trăm giảm giá
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Thumbnail
            </label>
            <input
              type="file"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50 hover:bg-white text-gray-800"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              accept="image/*"
            />
            {(thumbnailPreview || (editCourse?.thumbnail_url && !thumbnail)) && (
              <img
                src={thumbnailPreview || `${API_URL}${editCourse?.thumbnail_url}`}
                alt="Thumbnail preview"
                className="mt-3 w-40 h-40 object-cover rounded-lg shadow-sm"
              />
            )}
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-600">Kích hoạt khóa học</label>
          </div>
          <div className="flex gap-4 pt-4 md:col-span-2">
            <button
              type="button"
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r fromugmentation-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : editCourse ? "Lưu khóa học" : "Thêm khóa học"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;