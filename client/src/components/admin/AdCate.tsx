import React, { useState, useEffect } from "react";
import { MdSearch, MdEdit, MdDelete } from "react-icons/md";
import { Plus, X } from "lucide-react";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../services/CategoryService";
import { Category } from "../../types/types";

const AdCate = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editCate, setEditCate] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCategories();
        setCategories(data);
        setFilteredCategories(data);
      } catch (error: any) {
        setError(error.message || "Không thể tải danh sách danh mục");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const categoryId = await createCategory(categoryName, categoryDescription);
      const newCategory: Category = {
        id: categoryId,
        name: categoryName,
        description: categoryDescription,
        created_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCategory]);
      setShowAdd(false);
      setCategoryName("");
      setCategoryDescription("");
    } catch (error: any) {
      setError(error.message || "Không thể thêm danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCate) return;
    setLoading(true);
    setError(null);
    try {
      await updateCategory(editCate.id, categoryName, categoryDescription);
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editCate.id ? { ...cat, name: categoryName, description: categoryDescription } : cat
        )
      );
      setShowAdd(false);
      setEditCate(null);
      setCategoryName("");
      setCategoryDescription("");
    } catch (error: any) {
      setError(error.message || "Không thể cập nhật danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error: any) {
      setError(error.message || "Không thể xóa danh mục");
    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 transition-all duration-300"
      onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
    >
      <form
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative transform transition-all scale-100 hover:scale-[1.01]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={editCate ? handleEditCategory : handleAddCategory}
      >
        <button
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 group"
          onClick={() => setShowAdd(false)}
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          {editCate ? "Cập nhật danh mục" : "Thêm danh mục"}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <div className="space-y-6">
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-medium text-gray-600 transition-all duration-200">
              Mô tả
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              onClick={() => setShowAdd(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : editCate ? "Lưu danh mục" : "Thêm danh mục"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300 bg-white hover:bg-gray-50 text-gray-800 placeholder-gray-400"
              placeholder="Tìm kiếm theo tên hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setEditCate(null);
              setCategoryName("");
              setCategoryDescription("");
              setShowAdd(true);
            }}
            disabled={loading}
          >
            <Plus className="inline w-5 h-5 mr-2" /> Thêm danh mục
          </button>
        </div>
      </div>
      <div className="w-full flex-grow p-6">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-600">Đang tải...</p>
        ) : filteredCategories.length === 0 ? (
          <p className="text-center text-gray-600">Không tìm thấy danh mục</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold">ID</th>
                  <th className="p-4 text-left text-sm font-semibold">Tên danh mục</th>
                  <th className="p-4 text-left text-sm font-semibold">Mô tả</th>
                  <th className="p-4 text-left text-sm font-semibold">Ngày tạo</th>
                  <th className="p-4 text-left text-sm font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category, idx) => (
                  <tr
                    key={category.id}
                    className={`${idx % 2 !== 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-all duration-200`}
                  >
                    <td className="p-4 text-[15px] text-gray-900 font-medium">{category.id}</td>
                    <td className="p-4 text-[15px] text-gray-900 font-medium">{category.name}</td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">
                      {category.description || "Không có mô tả"}
                    </td>
                    <td className="p-4 text-[15px] text-gray-600 font-medium">
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                          title="Chỉnh sửa"
                          onClick={() => {
                            setEditCate(category);
                            setCategoryName(category.name);
                            setCategoryDescription(category.description || "");
                            setShowAdd(true);
                          }}
                          disabled={loading}
                        >
                          <MdEdit className="w-5 h-5 text-blue-500" />
                        </button>
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-all duration-200"
                          title="Xóa"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={loading}
                        >
                          <MdDelete className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showAdd && renderModal()}
    </div>
  );
};

export default AdCate;