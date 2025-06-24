const ReviewModel = require("../models/review.model");
const CourseModel = require("../models/course.model");
const EnrollmentModel = require("../models/enrollment.model");

const ReviewController = {
    getReviewsByCourse: async (req, res) => {
        try {
            const { courseId } = req.params;
            if (courseId !== '0') {
                const course = await CourseModel.findCourseById(courseId);
                if (!course) {
                    return res.status(404).json({ message: "Khóa học không tồn tại" });
                }
            }
            const reviews = await ReviewModel.getReviewsByCourse(courseId);
            return res.status(200).json({ data: reviews }); 
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

 
    getReviewById: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const review = await ReviewModel.findReviewById(reviewId);
            if (!review) {
                return res.status(404).json({ message: "Đánh giá không tồn tại" });
            }
            return res.status(200).json({ data: review });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

 
    createReview: async (req, res) => {
        try {
            const { courseId } = req.params;
            const { rating, comment } = req.body;
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Điểm đánh giá phải từ 1 đến 5" });
            }
            const course = await CourseModel.findCourseById(courseId);
            if (!course) {
                return res.status(404).json({ message: "Khóa học không tồn tại" });
            }
            const enrollment = await EnrollmentModel.checkEnrollment(req.user.userId, courseId);
            if (!enrollment) {
                return res.status(403).json({ message: "Bạn phải đăng ký khóa học để đánh giá" });
            }
            const reviewData = {
                user_id: req.user.userId,
                course_id: courseId,
                rating,
                comment,
            };
            const reviewId = await ReviewModel.createReview(reviewData);
            const reviews = await ReviewModel.getReviewsByCourse(courseId);
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            await CourseModel.updateRating(courseId, avgRating.toFixed(2), reviews.length);
            return res.status(201).json({ message: "Tạo đánh giá thành công", data: { reviewId } });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

   
    updateReview: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            if (rating && (rating < 1 || rating > 5)) {
                return res.status(400).json({ message: "Điểm đánh giá phải từ 1 đến 5" });
            }
            const review = await ReviewModel.findReviewById(reviewId);
            if (!review) {
                return res.status(404).json({ message: "Đánh giá không tồn tại" });
            }
            if (review.user_id !== req.user.userId && req.user.role !== "Admin") {
                return res.status(403).json({ message: "Không có quyền cập nhật" });
            }
            const reviewData = {
                rating: rating || review.rating,
                comment: comment || review.comment,
                is_approved: review.is_approved,
            };
            const success = await ReviewModel.updateReview(reviewId, reviewData);
            if (!success) {
                return res.status(400).json({ message: "Cập nhật thất bại" });
            }
            const reviews = await ReviewModel.getReviewsByCourse(review.course_id);
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            await CourseModel.updateRating(review.course_id, avgRating.toFixed(2), reviews.length);
            return res.status(200).json({ message: "Cập nhật đánh giá thành công" });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

   
    approveReview: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const review = await ReviewModel.findReviewById(reviewId);
            if (!review) {
                return res.status(404).json({ message: "Đánh giá không tồn tại" });
            }
            if (req.user.role !== "Admin") {
                return res.status(403).json({ message: "Không có quyền phê duyệt" });
            }
            const success = await ReviewModel.updateReviewApproval(reviewId, 1);
            if (!success) {
                return res.status(400).json({ message: "Phê duyệt thất bại" });
            }
            return res.status(200).json({ message: "Phê duyệt đánh giá thành công" });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

   
    deleteReview: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const review = await ReviewModel.findReviewById(reviewId);
            if (!review) {
                return res.status(404).json({ message: "Đánh giá không tồn tại" });
            }
            if (review.user_id !== req.user.userId && req.user.role !== "Admin") {
                return res.status(403).json({ message: "Không có quyền xóa" });
            }
            const success = await ReviewModel.deleteReview(reviewId);
            if (!success) {
                return res.status(400).json({ message: "Xóa thất bại" });
            }
            const reviews = await ReviewModel.getReviewsByCourse(review.course_id);
            const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
            await CourseModel.updateRating(review.course_id, avgRating.toFixed(2), reviews.length);
            return res.status(200).json({ message: "Xóa đánh giá thành công" });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
};

module.exports = ReviewController;