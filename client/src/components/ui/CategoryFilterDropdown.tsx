import React, { useEffect, useRef, useState } from 'react';
import { getAllCategories } from '../../services/CategoryService';
import { Category } from '../../types/types';

interface CategoryFilterDropdownProps {
  onFilterChange: (selectedCategories: number[]) => void;
}

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tải danh sách danh mục từ CategoryService
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCategories();
        console.log('Fetched Categories Data:', data); // Log dữ liệu đã xử lý
        setCategories(data || []);
      } catch (err: any) {
        console.error('Failed to load categories:', err);
        setError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleCheckboxChange = (categoryId: number) => {
    setSelectedCategories((prev) => {
      const updatedCategories = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      onFilterChange(updatedCategories);
      return updatedCategories;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex p-4 relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="text-black bg-cyan-400 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center"
        type="button"
      >
        Filter by category
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-100 mt-2 w-56 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
          <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Category</h6>
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải danh mục...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">Không có danh mục nào.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li className="flex items-center" key={cat.id}>
                  <input
                    id={`category-${cat.id}`}
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleCheckboxChange(cat.id)}
                    className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    htmlFor={`category-${cat.id}`}
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {cat.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryFilterDropdown;