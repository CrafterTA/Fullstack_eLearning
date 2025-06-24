import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAllCourses } from '../services/CourseService';
import { Course } from '../types/types';
import CategoryFilterDropdown from '../components/ui/CategoryFilterDropdown';
import PriceFilterDropdown from '../components/ui/PriceFilterDropdown';
import RatingFilterDropdown from '../components/ui/RatingFilterDropdown';
import DataScience from '../assets/images/datascience.png';
import { getUserEnrollments } from '../services/EnrollmentService';
import { Enrollment } from '../types/types';

const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<
    { id: string; label: string; min: number; max: number }[]
  >([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCourses();
        setCourses(data || []);
      } catch (err: any) {
        console.error('Failed to load courses:', err);
        setError('Failed to load courses. Please try again.');
      }
    };

    const fetchEnrollments = async () => {
      try {
        const enrollmentsData = await getUserEnrollments();
        setEnrollments(enrollmentsData || []);
      } catch (err: any) {
        console.error('Failed to load enrollments:', err);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('query');
    const applyFilters = () => {
      let tempCourses = courses.filter((course) =>
        (course.title?.toLowerCase().includes((query || '').toLowerCase()) ||
          course.description?.toLowerCase().includes((query || '').toLowerCase())) &&
        !enrollments.some((enrollment) => enrollment.course_id === course.id)
      );

      // Lọc theo danh mục
      if (selectedCategories.length > 0) {
        tempCourses = tempCourses.filter((course) =>
          selectedCategories.includes(course.category_id)
        );
      }

      // Lọc theo giá
      if (selectedPriceRanges.length > 0) {
        tempCourses = tempCourses.filter((course) =>
          selectedPriceRanges.some(
            (range) => (course.price || 0) >= range.min && (course.price || 0) <= range.max
          )
        );
      }

      // Lọc theo xếp hạng
      if (selectedRatings.length > 0) {
        tempCourses = tempCourses.filter((course) =>
          selectedRatings.some((rating) => (course.avg_rating || 0) >= rating)
        );
      }

      setFilteredCourses(tempCourses);
    };

    applyFilters();
  }, [location.search, courses, enrollments, selectedCategories, selectedPriceRanges, selectedRatings]);

  const baseUrl = 'http://localhost:3000';

  if (loading) return <p className="text-center text-gray-500 mt-6 mb-6 font-bold">Loading courses...</p>;
  if (error) return <p className="text-center text-red-500 mt-6">{error}</p>;

  return (
    <div className="py-4 mx-auto lg:max-w-7xl md:max-w-4xl max-w-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">Search Results</h2>
      <div className="flex">
        <CategoryFilterDropdown onFilterChange={setSelectedCategories} />
        <PriceFilterDropdown onFilterChange={setSelectedPriceRanges} />
        <RatingFilterDropdown onFilterChange={setSelectedRatings} />
      </div>

      {filteredCourses.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">No courses found for "{new URLSearchParams(location.search).get('query')}".</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-1 gap-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="course-card"
            >
              <div className="course-card-image w-[285px] h-[200px] rounded-[12px]">
                <img
                  src={course.thumbnail_url ? `${baseUrl}${course.thumbnail_url}` : DataScience}
                  alt={course.title || 'Course Image'}
                  className="w-[285px] h-[135px] object-cover"
                  onError={(e) => {
                    console.error('Error loading image:', e);
                    e.currentTarget.src = DataScience;
                  }}
                />
              </div>
              <div className="course-card-title text-[16px] font-bold mt-2">
                {course.title || 'No Title'}
              </div>
              <div className="course-card-description text-[16px] mt-2">
                {course.description || 'No description available'}
              </div>
              <div className="course-card-button mt-4">
                <div className="flex mr-[165px]">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-4 h-4 ms-1 ${
                        index < Math.floor(Number(course.avg_rating) || 0)
                          ? 'text-yellow-300'
                          : 'text-gray-300'
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                  ))}
                </div>
                <div className="price py-[20px] flex items-center gap-[10px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                    />
                  </svg>
                  <span className="text-[16px] font-bold text-[#3DCBB1]">
                    {(course.price || 0).toLocaleString()} ₫
                  </span>
                  {course.discount_percentage && Number(course.discount_percentage) !== 0 && (
                    <span className="text-[16px] font-bold text-gray-500 line-through">
                      {(
                        (course.price || 0) / (1 - (course.discount_percentage || 0) / 100)
                      ).toLocaleString()}{' '}
                      ₫
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;