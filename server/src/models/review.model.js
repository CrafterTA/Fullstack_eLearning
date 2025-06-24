const db = require("../config/db");

const ReviewModel = {
    createReview: async (reviewData) => {
        try {
            const { user_id, course_id, rating, comment, is_approved = 0 } = reviewData;
            const query = `
                INSERT INTO reviews (user_id, course_id, rating, comment, is_approved)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await db.query(query, [user_id, course_id, rating, comment, is_approved]);
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating review: ${error.message}`);
        }
    },

    getReviewsByCourse: async (courseId) => {
        try {
            let query;
            let params = [];
            if (courseId === '0') {
                query = `
                    SELECT r.*, u.full_name 
                    FROM reviews r 
                    JOIN users u ON r.user_id = u.id 
                    ORDER BY r.created_at DESC
                `;
            } else {
                query = `
                    SELECT r.*, u.full_name 
                    FROM reviews r 
                    JOIN users u ON r.user_id = u.id 
                    WHERE r.course_id = ? 
                    ORDER BY r.created_at DESC
                `;
                params = [courseId];
            }
            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Error fetching reviews by course: ${error.message}`);
        }
    },

    findReviewById: async (reviewId) => {
        try {
            const query = `SELECT * FROM reviews WHERE id = ?`;
            const [rows] = await db.query(query, [reviewId]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding review by ID: ${error.message}`);
        }
    },

    updateReviewApproval: async (reviewId, is_approved) => {
        try {
            const query = `UPDATE reviews SET is_approved = ? WHERE id = ?`;
            const [result] = await db.query(query, [is_approved, reviewId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating review approval: ${error.message}`);
        }
    },

    updateReview: async (reviewId, reviewData) => {
        try {
            const { rating, comment, is_approved } = reviewData;
            const query = `
                UPDATE reviews 
                SET rating = ?, comment = ?, is_approved = ?
                WHERE id = ?
            `;
            const [result] = await db.query(query, [rating, comment, is_approved, reviewId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating review: ${error.message}`);
        }
    },

    deleteReview: async (reviewId) => {
        try {
            const query = `DELETE FROM reviews WHERE id = ?`;
            const [result] = await db.query(query, [reviewId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting review: ${error.message}`);
        }
    },
};

module.exports = ReviewModel;