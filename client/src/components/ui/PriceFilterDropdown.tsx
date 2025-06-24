import React, { useEffect, useRef, useState } from 'react';

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

interface PriceFilterDropdownProps {
  onFilterChange: (selectedRanges: PriceRange[]) => void;
}

const priceRanges: PriceRange[] = [
  { id: 'under-100', label: 'Dưới 100.000₫', min: 0, max: 100000 },
  { id: '100-200', label: '100.000₫ – 200.000₫', min: 100000, max: 200000 },
  { id: '200-500', label: '200.000₫ – 500.000₫', min: 200000, max: 500000 },
  { id: 'over-500', label: 'Trên 500.000₫', min: 500001, max: Infinity },
];

export default function PriceFilterDropdown({ onFilterChange }: PriceFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRanges, setSelectedRanges] = useState<PriceRange[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleCheckboxChange = (range: PriceRange) => {
    setSelectedRanges((prev) => {
      const updatedRanges = prev.some((r) => r.id === range.id)
        ? prev.filter((r) => r.id !== range.id)
        : [...prev, range];
      onFilterChange(updatedRanges);
      return updatedRanges;
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
        Filter by price
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
          <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Chọn mức giá</h6>
          <ul className="space-y-2 text-sm">
            {priceRanges.map((range) => (
              <li className="flex items-center" key={range.id}>
                <input
                  id={range.id}
                  type="checkbox"
                  checked={selectedRanges.some((r) => r.id === range.id)}
                  onChange={() => handleCheckboxChange(range)}
                  className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <label
                  htmlFor={range.id}
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {range.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}