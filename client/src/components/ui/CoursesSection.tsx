import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../../services/CourseService';
import { getUserEnrollments } from '../../services/EnrollmentService';
import { Course, Enrollment } from '../../types/types';
import DataScience from '../../assets/images/datascience.png';
import { useAuth } from '../../context/AuthContext';

const CoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const coursesData = await getAllCourses();
        console.log('Fetched Courses for CoursesSection:', coursesData);

        let filteredCourses = coursesData;
        if (isAuthenticated) {
          const enrollmentsData = await getUserEnrollments();
          console.log('Fetched Enrollments for CoursesSection:', enrollmentsData);
          filteredCourses = coursesData.filter(
            (course) => !enrollmentsData.some((enrollment) => enrollment.course_id === course.id)
          );
          setEnrollments(enrollmentsData);
        }

        setCourses(filteredCourses.slice(0, 4));
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Không thể tải khóa học. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const renderStars = (rating: number | undefined = 0) => {
    const safeRating = Number(rating) || 0;
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 ms-1 ${
              index < Math.floor(safeRating) ? 'text-yellow-300' : 'text-gray-300'
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        ))}
        <span className="ml-2 text-gray-500">({safeRating.toFixed(1)})</span>
      </div>
    );
  };

  const baseUrl = 'http://localhost:3000';

  return (
    <div className="py-16 md:px-40 px-8 text-center">
      <h2 className="text-3xl font-medium text-gray-800">Learn from the best</h2>

      {loading ? (
        <p className="text-center text-gray-500 mt-6 mb-6 font-bold">Đang tải khóa học...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-6">{error}</p>
      ) : courses.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">Không có khóa học nào để hiển thị.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0 md:my-10 my-10">
          {courses.map((course) => {
            const price = Number(course.price) || 0;
            const discountPercentage = Number(course.discount_percentage) || 0;
            const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="course-card"
              >
                <div className="course-card-image w-[285px] h-[200px] rounded-[12px]">
                  <img
                    src={course.thumbnail_url ? `${baseUrl}${course.thumbnail_url}` : DataScience}
                    alt={course.title || 'Course Image'}
                    className="w-[285px] h-[135px] object-fill"
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      e.currentTarget.src = DataScience;
                    }}
                  />
                </div>
                <div className="course-card-title text-[16px] font-bold mt-2">
                  {course.title || 'Không có tiêu đề'}
                </div>
                <div className="course-card-description text-[16px] mt-2">
                  {course.description || 'Không có mô tả'}
                </div>
                <div className="course-card-button mt-4">
                  <div className="flex mr-[125px]">
                    {renderStars(course.rating)} {/* Use course.rating instead of course.avg_rating */}
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
                    {discountPercentage > 0 ? (
                      <>
                        <span className="text-[18px] font-semibold text-slate-900">
                          {discountedPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                        <span className="text-[16px] text-gray-500 line-through">
                          {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                        <span className="text-[14px] text-green-600">
                          Giảm {discountPercentage}%!
                        </span>
                      </>
                    ) : (
                      <span className="text-[18px] font-semibold text-slate-900">
                        {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <Link
        to="/courses"
        onClick={() => scrollTo(0, 0)}
        className="text-gray-500 border border-500/30 px-10 py-3 rounded"
      >
        See all courses
      </Link>
    </div>
  );
};

export default CoursesSection;