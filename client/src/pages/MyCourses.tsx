import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserEnrollments } from '../services/EnrollmentService';
import { Enrollment } from '../types/types';

export default function MyCourses() {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const baseUrl = 'http://localhost:3000';

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const enrollments = await getUserEnrollments();
        console.log('Danh sách ghi danh:', enrollments);
        setCourses(Array.isArray(enrollments) ? enrollments : []);
        setLoading(false);
      } catch (err: any) {
        console.error('Lỗi khi lấy danh sách ghi danh:', err);
        setError(err.response?.status === 401 ? 'Vui lòng đăng nhập lại' : 'Không thể tải danh sách khóa học');
        setCourses([]);
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="py-4 mx-auto lg:max-w-6xl md:max-w-4xl max-w-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">My Courses</h2>
      
      {courses.length === 0 ? (
        <p className="text-center text-gray-600">Bạn chưa đăng ký khóa học nào.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-3 rounded-lg group overflow-hidden cursor-pointer relative z-50 hover:before:bg-black before:absolute before:inset-0 before:opacity-20 before:transition-all"
              onClick={() => navigate(`/player?courseId=${course.course_id}`)}
            >
              <div className="w-full aspect-[3/4] overflow-hidden mx-auto">
                <img
                  src={course.thumbnail_url ? `${baseUrl}${course.thumbnail_url}` : 'https://readymadeui.com/images/sunglass7.webp'}
                  alt={course.title}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-4">{course.title}</h3>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}