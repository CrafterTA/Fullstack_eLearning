import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getCourseDetails } from '../services/CourseService';
import { addToCart } from '../services/CartService';
import { getReviewsByCourse } from '../services/ReviewService'; // Import ReviewService
import { Course, Lesson, Review } from '../types/types';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]); // State cho reviews
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cartMessage, setCartMessage] = useState<string>('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError('Không tìm thấy ID khóa học');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Lấy thông tin khóa học
        const courseData = await getCourseById(Number(id));
        if (courseData) {
          setCourse(courseData);
        } else {
          setError('Không tìm thấy khóa học');
        }

        // Lấy bài học
        const courseDetails = await getCourseDetails(Number(id));
        if (courseDetails && courseDetails.lessons) {
          setLessons(courseDetails.lessons);
        }

        // Lấy đánh giá
        const reviewData = await getReviewsByCourse(Number(id));
        setReviews(reviewData.filter((review) => review.is_approved)); // Chỉ lấy đánh giá đã phê duyệt
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${i <= roundedRating ? 'fill-slate-800' : 'fill-[#CED5D8]'}`}
          viewBox="0 0 14 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 0L9.4687 3.60213L13.6574 4.83688L10.9944 8.29787L11.1145 12.6631L7 11.2L2.8855 12.6631L3.00556 8.29787L0.342604 4.83688L4.5313 3.60213L7 0Z" />
        </svg>
      );
    }
    return stars;
  };

  const handleAddToCart = async () => {
    if (!course) return;

    try {
      await addToCart(course.id);
      setCartMessage('Khóa học đã được thêm vào giỏ hàng!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi thêm vào giỏ hàng.';
      if (errorMessage.includes('EnrollmentModel.checkEnrollment is not a function')) {
        setCartMessage('Hệ thống gặp lỗi. Vui lòng liên hệ hỗ trợ hoặc thử lại sau.');
      } else if (errorMessage.includes('Khóa học đã có trong giỏ hàng')) {
        setCartMessage('Khóa học này đã có trong giỏ hàng. Bạn có muốn xem giỏ hàng không?');
        setTimeout(() => {
          if (window.confirm('Xem giỏ hàng?')) {
            navigate('/cart');
          }
          setCartMessage('');
        }, 3000);
      } else if (errorMessage.includes('Bạn đã mua khóa học này')) {
        setCartMessage('Bạn đã mua khóa học này. Không thể thêm vào giỏ hàng.');
      } else {
        setCartMessage(`Lỗi: ${errorMessage}`);
      }
      setTimeout(() => setCartMessage(''), 5000);
      console.error('Add to cart error:', err);
    }
  };

  const handleBuyNow = async () => {
    if (!course) return;

    try {
      await addToCart(course.id);
      navigate('/cart');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi thêm vào giỏ hàng.';
      if (errorMessage.includes('EnrollmentModel.checkEnrollment is not a function')) {
        setCartMessage('Hệ thống gặp lỗi. Vui lòng liên hệ hỗ trợ hoặc thử lại sau.');
      } else if (errorMessage.includes('Khóa học đã có trong giỏ hàng')) {
        setCartMessage('Khóa học này đã có trong giỏ hàng. Đang chuyển đến giỏ hàng...');
        setTimeout(() => {
          navigate('/cart');
          setCartMessage('');
        }, 3000);
      } else if (errorMessage.includes('Bạn đã mua khóa học này')) {
        setCartMessage('Bạn đã mua khóa học này. Không thể thêm vào giỏ hàng.');
      } else {
        setCartMessage(`Lỗi: ${errorMessage}`);
      }
      setTimeout(() => setCartMessage(''), 5000);
      console.error('Buy now error:', err);
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-slate-900">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-slate-900">Không tìm thấy khóa học</p>
      </div>
    );
  }

  const price = Number(course.price);
  const discountPercentage = Number(course.discount_percentage) || 0;
  const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

  const baseUrl = 'http://localhost:3000';

  return (
    <div>
      {cartMessage && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md shadow-md z-50 ${
            cartMessage.includes('Lỗi') || cartMessage.includes('Hệ thống')
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600'
          }`}
        >
          {cartMessage}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Thumbnail Section */}
          <div className="w-full lg:w-1/2">
            <div className="overflow-hidden">
              <img
                src={course.thumbnail_url ? `${baseUrl}${course.thumbnail_url}` : 'https://via.placeholder.com/600x400'}
                alt={course.title}
                className="w-full h-auto object-cover rounded-lg shadow-md hover:scale-[1.05] transition-all duration-300"
              />
            </div>
            {/* Reviews Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-900">Đánh giá từ học viên</h3>
              {reviews.length > 0 ? (
                <div className="mt-4 space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-slate-900">{review.full_name}</p>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                        <p className="text-xs text-gray-500">{review.created_at ? formatDate(review.created_at) : 'N/A'}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{review.comment || 'Không có bình luận'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-4">Chưa có đánh giá nào cho khóa học này.</p>
              )}
            </div>
          </div>

          {/* Course Details Section */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{course.title}</h2>
              <p className="text-sm text-gray-500 mt-2">{course.description || 'Không có mô tả'}</p>
            </div>

            <div className="flex items-center space-x-1 mt-6">
              {renderStars(course.rating)}
              <button
                type="button"
                className="px-2.5 py-1.5 bg-slate-100 text-xs text-slate-900 rounded-md flex items-center cursor-pointer !ml-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M14.236 21.954h-3.6c-.91 0-1.65-.74-1.65-1.65v-7.201c0-.91.74-1.65 1.65-1.65h3.6a.75.75 0 0 1 .75.75v9.001a.75.75 0 0 1-.75.75zm-3.6-9.001a.15.15 0 0 0-.15.15v7.2a.15.15 0 0 0 .15.151h2.85v-7.501z" />
                  <path d="M20.52 21.954h-6.284a.75.75 0 0 1-.75-.75v-9.001c0-.257.132-.495.348-.633.017-.011 1.717-1.118 2.037-3.25.18-1.184 1.118-2.089 2.28-2.201a2.557 2.557 0 0 1 2.17.868c.489.56.71 1.305.609 2.042a9.468 9.468 0 0 1-.678 2.424h.943a2.56 2.56 0 0 1 1.918.862c.483.547.708 1.279.617 2.006l-.675 5.401a2.565 2.565 0 0 1-2.535 2.232zm-5.534-1.5h5.533a1.06 1.06 0 0 0 1.048-.922l.675-5.397a1.046 1.046 0 0 0-1.047-1.182h-2.16a.751.751 0 0 1-.648-1.13 8.147 8.147 0 0 0 1.057-3 1.059 1.059 0 0 0-.254-.852 1.057 1.057 0 0 0-.795-.365c-.577.052-.964.435-1.04.938-.326 2.163-1.71 3.507-2.369 4.036v7.874z" />
                  <path d="M4 31.75a.75.75 0 0 1-.612-1.184c1.014-1.428 1.643-2.999 1.869-4.667.032-.241.055-.485.07-.719A14.701 14.701 0 0 1 1.25 15C1.25 6.867 7.867.25 16 .25S30.75 6.867 30.75 15 24.133 29.75 16 29.75a14.57 14.57 0 0 1-5.594-1.101c-2.179 2.045-4.61 2.81-6.281 3.09A.774.774 0 0 1 4 31.75zm12-30C8.694 1.75 2.75 7.694 2.75 15c0 3.52 1.375 6.845 3.872 9.362a.75.75 0 0 1 .217.55c-.01.373-.042.78-.095 1.186A11.715 11.715 0 0 1 5.58 29.83a10.387 10.387 0 0 0 3.898-2.370l.231-.231a.75.75 0 0 1 .84-.153A13.072 13.072 0 0 0 16 28.25c7.306 0 13.25-5.944 13.25-13.25S23.306 1.75 16 1.75z" />
                </svg>
              </button>
            </div>

            <div className="mt-8">
              <div className="flex items-center flex-wrap gap-4">
                {discountPercentage > 0 ? (
                  <>
                    <p className="text-slate-900 text-4xl font-semibold">${discountedPrice.toFixed(2)}</p>
                    <p className="text-slate-500 text-lg line-through">${price.toFixed(2)}</p>
                    <p className="text-green-600 text-sm">Giảm {discountPercentage}%!</p>
                  </>
                ) : (
                  <p className="text-slate-900 text-4xl font-semibold">${price.toFixed(2)}</p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full px-4 py-2.5 cursor-pointer border border-slate-800 bg-transparent hover:bg-slate-50 text-slate-900 text-sm font-medium rounded-md"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full px-4 py-2.5 cursor-pointer border border-slate-800 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-md"
              >
                Buy now
              </button>
            </div>

            <div className="mt-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Course Description</h3>
                <p className="text-sm text-slate-500 mt-4">{course.description || 'Không có mô tả'}</p>
              </div>
            </div>

            <div className="mt-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Course Content</h3>
                <div className="mt-4 space-y-4">
                  {lessons.length > 0 ? (
                    lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center space-x-2 text-sm text-slate-900 font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span>{lesson.title}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Không có bài học nào.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;