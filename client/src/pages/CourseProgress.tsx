import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VideoPlayer from "../components/ui/video-player";
import { getCourseDetails } from "../services/CourseService";
import { getReviewsByCourse, createReview } from "../services/ReviewService";
import { Lesson, Video, Material, Review } from "../types/types";

interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  curriculum: Lesson[];
}

function CourseProgress() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = Number(searchParams.get("courseId")) || 0;
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (!courseId) {
          setError('ID khóa học không hợp lệ');
          setLoading(false);
          return;
        }

        const courseData = await getCourseDetails(courseId);
        if (!courseData) {
          setError('Không tìm thấy khóa học');
          setLoading(false);
          return;
        }

        const curriculum = (courseData.lessons ?? []).map((lesson) => ({
          ...lesson,
          videos: lesson.videos || [],
          materials: lesson.materials || [],
        }));

        setCourse({
          _id: courseId.toString(),
          title: courseData.title || "Untitled Course",
          description: courseData.description || "No description available",
          curriculum,
        });

        setCurrentLesson(curriculum[0] || null);
        setLoading(false);
      } catch (err: any) {
        console.error('Lỗi khi lấy dữ liệu khóa học:', err);
        setError(err.response?.data?.message || 'Không thể tải khóa học');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await getReviewsByCourse(courseId);
        setReviews(reviewsData.filter((review: Review) => review.is_approved));
      } catch (err: any) {
        console.error('Lỗi khi lấy đánh giá:', err);
        setReviewError('Không thể tải đánh giá');
      }
    };

    if (courseId) {
      fetchReviews();
    }
  }, [courseId]);

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentVideo(null);
    setCurrentMaterial(null);
  };

  const handleVideoClick = (video: Video) => {
    setCurrentVideo(video);
    setCurrentMaterial(null);
  };

  const handleMaterialClick = (material: Material) => {
    setCurrentMaterial(material);
    setCurrentVideo(null);
  };

  const handleSubmitReview = async () => {
    try {
      if (rating < 1 || rating > 5) {
        setReviewError('Vui lòng chọn số sao từ 1 đến 5');
        return;
      }
      await createReview(courseId, { rating, comment });
      setRating(0);
      setComment("");
      setReviewError(null);
      const reviewsData = await getReviewsByCourse(courseId);
      setReviews(reviewsData.filter((review: Review) => review.is_approved));
    } catch (err: any) {
      setReviewError(err.message || 'Lỗi khi gửi đánh giá');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${index < rating ? "text-yellow-400" : "text-gray-400"}`}
            fill={index < rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  let content;
  if (loading) {
    content = <div className="text-center py-10">Đang tải...</div>;
  } else if (error || !course) {
    content = (
      <div className="text-center py-10 text-red-500">
        {error || `Không tìm thấy khóa học với ID ${courseId}`}
      </div>
    );
  } else {
    const videoUrl = currentVideo?.video_url ? `http://localhost:3000/${currentVideo.video_url}` : "";
    const materialUrl = currentMaterial?.file_url ? `http://localhost:3000/${currentMaterial.file_url}` : "";

    content = (
      <div className="flex flex-col min-h-screen bg-[#1c1d1f] text-white">
        <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate("/mycourses")}
              className="text-black bg-white"
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to My Courses Page
            </Button>
            <div className="text-lg font-bold hidden md:block">{course.title}</div>
          </div>
          <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
            {isSideBarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex flex-1">
          <div
            className={`fixed top-[64px] left-0 bottom-0 w-[400px] bg-[#1c1d1f] border-r border-gray-700 transition-all duration-300 ${
              isSideBarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Tabs defaultValue="content" className="h-full flex flex-col">
              <TabsList className="grid bg-white w-full grid-cols-2 p-0 h-14">
                <TabsTrigger
                  value="content"
                  className="text-black rounded-none h-full hover:bg-gray-100 hover:rounded cursor-pointer"
                >
                  Course Content
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="text-black rounded-none h-full hover:bg-gray-100 hover:rounded cursor-pointer"
                >
                  Overview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {course.curriculum.length > 0 ? (
                      course.curriculum.map((lesson) => (
                        <div key={lesson.id} className="cursor-pointer" onClick={() => handleLessonClick(lesson)}>
                          <div className="flex items-center space-x-2 text-sm text-white font-bold">
                            <Play className="h-4 w-4" />
                            <span>{lesson.title}</span>
                          </div>
                          {lesson.videos.length > 0 && (
                            <div className="ml-6 mt-2 space-y-2">
                              {lesson.videos.map((video) => (
                                <div
                                  key={video.id}
                                  className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVideoClick(video);
                                  }}
                                >
                                  <Play className="h-4 w-4" />
                                  <span>{video.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {lesson.materials.length > 0 && (
                            <div className="ml-6 mt-2 space-y-2">
                              {lesson.materials.map((material) => (
                                <div
                                  key={material.id}
                                  className="flex items-center space-x-2 text-sm text-blue-400 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMaterialClick(material);
                                  }}
                                >
                                  <span>{material.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center">Không có bài học nào.</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="overview" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">About this course</h2>
                    <p className="text-gray-400">{course.description}</p>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          <div className={`flex-1 ${isSideBarOpen ? "ml-[400px]" : ""} transition-all duration-300`}>
            <div className="p-6 bg-[#1c1d1f] text-white">
              <div className="text-2xl font-bold">{currentLesson?.title || "Không có bài học được chọn"}</div>
              {currentVideo ? (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Video: {currentVideo.title}</h3>
                  <VideoPlayer width="100%" height="500px" url={videoUrl} />
                </div>
              ) : currentMaterial ? (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Tài liệu: {currentMaterial.title}</h3>
                  <div className="relative w-full" style={{ height: '600px' }}>
                    <iframe
                      src={materialUrl}
                      width="100%"
                      height="100%"
                      className="border-none"
                      title={currentMaterial.title}
                      scrolling="auto"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 mt-2">Vui lòng chọn video hoặc tài liệu để xem.</p>
              )}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Đánh giá khóa học</h3>
                {reviewError && <p className="text-red-500">{reviewError}</p>}
                <div className="mb-4">
                  <h4 className="text案件lg font-semibold">Gửi đánh giá của bạn</h4>
                  <div className="flex items-center space-x-2">
                    <Label>Điểm số:</Label>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-6 w-6 cursor-pointer ${
                            index < rating ? "text-yellow-400" : "text-gray-400"
                          }`}
                          fill={index < rating ? "currentColor" : "none"}
                          onClick={() => setRating(index + 1)}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="w-full mt-2 p-2 bg-gray-800 text-white rounded"
                    placeholder="Viết bình luận của bạn..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmitReview}
                  >
                    Gửi đánh giá
                  </Button>
                </div>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-t border-gray-700 pt-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{review.full_name || "Anonymous"}</span>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-400 mt-1">{review.comment || "Không có bình luận"}</p>
                        <p className="text-gray-500 text-sm">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">Chưa có đánh giá nào cho khóa học này.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return content;
}

export default CourseProgress;