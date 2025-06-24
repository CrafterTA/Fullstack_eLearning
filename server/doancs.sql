use defaultdb;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Instructor', 'User') DEFAULT 'User',
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    refresh_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    created_by INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    discounted_price DECIMAL(10, 2) GENERATED ALWAYS AS (price * (1 - discount_percentage / 100)) STORED,
    thumbnail_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0,
    total_students INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_ratings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);


CREATE TABLE videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255) NOT NULL,
    order_number INT DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);


CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id)
);


CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (cart_id, course_id)
);


CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cart_id INT NOT NULL,
    payment_method ENUM('Bank Transfer', 'Credit Card', 'PayPal', 'Mobile Payment') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    transaction_id VARCHAR(255),
    payos_order_code VARCHAR(50) UNIQUE,
    payos_checkout_url VARCHAR(255),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE
);


CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id)
);


CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Trigger để tự động đăng ký khóa học và xóa giỏ hàng khi thanh toán thành công
DELIMITER //
CREATE TRIGGER enroll_user_after_payment
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'Success' AND OLD.status != 'Success' THEN
        INSERT INTO enrollments (user_id, course_id, enrolled_at)
        SELECT c.user_id, ci.course_id, NOW()
        FROM cart c
        JOIN cart_items ci ON c.id = ci.cart_id
        WHERE c.id = NEW.cart_id
        ON DUPLICATE KEY UPDATE enrolled_at = NOW();
        
        DELETE FROM cart_items WHERE cart_id = NEW.cart_id;
        
        UPDATE courses co
        SET co.total_students = (
            SELECT COUNT(*) 
            FROM enrollments e 
            WHERE e.course_id = co.id
        )
        WHERE co.id IN (
            SELECT course_id 
            FROM cart_items 
            WHERE cart_id = NEW.cart_id
        );
    END IF;
END //
DELIMITER ;

-- Trigger để tự động tăng total_students sau khi thêm mới enrollment
DELIMITER //
CREATE TRIGGER increment_total_students_after_enrollment
AFTER INSERT ON enrollments
FOR EACH ROW
BEGIN
    UPDATE courses
    SET total_students = total_students + 1
    WHERE id = NEW.course_id;
END //
DELIMITER ;

-- Trigger để cập nhật giá giảm giá khi thay đổi giá hoặc phần trăm giảm giá
DELIMITER //
CREATE TRIGGER update_discounted_price
BEFORE UPDATE ON courses
FOR EACH ROW
BEGIN
    SET NEW.discounted_price = NEW.price * (1 - NEW.discount_percentage / 100);
END //
DELIMITER ;

-- Chỉ mục để tối ưu hóa truy vấn
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_items_cart_course ON cart_items(cart_id, course_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_cart_id ON payments(cart_id);
CREATE INDEX idx_payments_payos_order_code ON payments(payos_order_code);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_reviews_course_id ON reviews(course_id);
CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_videos_lesson_id ON videos(lesson_id);
CREATE INDEX idx_materials_lesson_id ON materials(lesson_id);


-- INSERT DATA
INSERT INTO categories (name, description) VALUES
('Web Development', 'Learn how to build websites and web applications using HTML, CSS, JavaScript, and modern frameworks.'),
('Mobile Development', 'Courses on creating apps for Android, iOS, and cross-platform using React Native, Flutter, etc.'),
('Data Science', 'Learn data analysis, machine learning, and data visualization using Python, R, and popular libraries.'),
('AI & Machine Learning', 'Courses covering deep learning, neural networks, NLP, and AI applications.'),
('Cybersecurity', 'Learn ethical hacking, network security, cryptography, and threat detection techniques.'),
('Cloud Computing', 'Master cloud platforms like AWS, Azure, and Google Cloud for infrastructure and services.'),
('DevOps & CI/CD', 'Understand Docker, Kubernetes, Jenkins, and continuous integration/deployment pipelines.'),
('Game Development', 'Courses on Unity, Unreal Engine, 2D/3D game design, and game programming.'),
('Software Engineering', 'Core principles of software development including OOP, design patterns, and software architecture.'),
('Database & SQL', 'Learn about relational and NoSQL databases, SQL queries, normalization, and performance tuning.'),
('Programming Languages', 'Courses on Python, Java, JavaScript, C++, Go, and other programming languages.'),
('Blockchain Development', 'Learn how to build dApps, smart contracts, and understand blockchain concepts.'),
('UI/UX Design', 'Courses on user interface design, user experience, Figma, Adobe XD, and usability principles.'),
('IT Certifications', 'Prepare for exams like CompTIA, Cisco (CCNA), AWS Certified Solutions Architect, etc.'),
('Operating Systems & Networking', 'Understand the basics of Linux, Windows Server, computer networking, TCP/IP, and protocols.');



INSERT INTO courses (
    id, title, description, category_id, created_by,
    price, discount_percentage,
    thumbnail_url, is_active, views, total_students,
    rating, total_ratings
) VALUES
(4, 'Natural Language Processing v1', 'Learn all about NLP: LSTM, RNN, Transformers,...', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/nlpthumb.jpg', 1, 0, 0, 5.00, 1),
(5, 'AI & Machine Learning Full Course', 'Comprehensive course on AI and Machine Learning from scratch.', 2, 1, 200000.00, 10.00, '/uploads/thumbnails/ai&machinelearning.jpg', 1, 0, 0, 0.00, 0),
(6, 'AI and ML Introduction', 'Learn the fundamentals of AI and Machine Learning.', 2, 1, 200000.00, 15.00, '/uploads/thumbnails/ai_and_ml.jpg', 1, 0, 0, 0.00, 0),
(7, 'AI and Machine Learning Courses Overview', 'A quick overview of top-rated AI/ML courses.', 2, 1, 200000.00, 5.00, '/uploads/thumbnails/AI-And-Machine-Learning-Courses.jpg', 1, 0, 0, 0.00, 0),
(8, 'Artificial Intelligence Explained', 'Understand AI from the ground up.', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/Artificial-intelligence.jpg', 1, 0, 0, 0.00, 0),
(9, 'Top Machine Learning Courses', 'Best courses to learn ML online.', 2, 1, 200000.00, 20.00, '/uploads/thumbnails/best_machine_learning_course.webp', 1, 0, 0, 0.00, 0),
(10, 'Machine Learning Specialization', 'Specialization program in Machine Learning.', 2, 1, 200000.00, 25.00, '/uploads/thumbnails/coursera.png', 1, 0, 0, 0.00, 0),
(11, 'MAD Landscape 2024 - AI Overview', 'Exploring the MAD landscape in modern AI.', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/firstmark-mad-landscape-open-graph_purple-1.jpeg', 1, 0, 0, 0.00, 0),
(12, 'Google Machine Learning Crash Course', 'ML crash course by Google for beginners.', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/Google-machine-Learning.png', 1, 0, 0, 0.00, 0),
(13, 'AI & ML in 11 Hours - Intellipaat', 'Fast-track AI & ML learning.', 2, 1, 200000.00, 30.00, '/uploads/thumbnails/intellipaat.jpg', 1, 0, 0, 0.00, 0),
(14, 'Understand the Basics of Machine Learning', 'Start your ML journey with this beginner-friendly course.', 2, 1, 200000.00, 10.00, '/uploads/thumbnails/Understand_the_Basic_of_ML.jpg', 1, 0, 0, 0.00, 0),
(16, 'Example', 'Data example', 2, 1, 5000.00, 0.00, '/uploads/thumbnails/1747271069242-832999796.png', 1, 0, 0, 0.00, 0);



-- INSERT DATA
INSERT INTO categories (name, description) VALUES
('Web Development', 'Learn how to build websites and web applications using HTML, CSS, JavaScript, and modern frameworks.'),
('Mobile Development', 'Courses on creating apps for Android, iOS, and cross-platform using React Native, Flutter, etc.'),
('Data Science', 'Learn data analysis, machine learning, and data visualization using Python, R, and popular libraries.'),
('AI & Machine Learning', 'Courses covering deep learning, neural networks, NLP, and AI applications.'),
('Cybersecurity', 'Learn ethical hacking, network security, cryptography, and threat detection techniques.'),
('Cloud Computing', 'Master cloud platforms like AWS, Azure, and Google Cloud for infrastructure and services.'),
('DevOps & CI/CD', 'Understand Docker, Kubernetes, Jenkins, and continuous integration/deployment pipelines.'),
('Game Development', 'Courses on Unity, Unreal Engine, 2D/3D game design, and game programming.'),
('Software Engineering', 'Core principles of software development including OOP, design patterns, and software architecture.'),
('Database & SQL', 'Learn about relational and NoSQL databases, SQL queries, normalization, and performance tuning.'),
('Programming Languages', 'Courses on Python, Java, JavaScript, C++, Go, and other programming languages.'),
('Blockchain Development', 'Learn how to build dApps, smart contracts, and understand blockchain concepts.'),
('UI/UX Design', 'Courses on user interface design, user experience, Figma, Adobe XD, and usability principles.'),
('IT Certifications', 'Prepare for exams like CompTIA, Cisco (CCNA), AWS Certified Solutions Architect, etc.'),
('Operating Systems & Networking', 'Understand the basics of Linux, Windows Server, computer networking, TCP/IP, and protocols.');



INSERT INTO courses (
    id, title, description, category_id, created_by,
    price, discount_percentage,
    thumbnail_url, is_active, views, total_students,
    rating, total_ratings
) VALUES
(4, 'Natural Language Processing v1', 'Learn all about NLP: LSTM, RNN, Transformers,...', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/nlpthumb.jpg', 1, 0, 0, 5.00, 1),
(5, 'AI & Machine Learning Full Course', 'Comprehensive course on AI and Machine Learning from scratch.', 2, 1, 200000.00, 10.00, '/uploads/thumbnails/ai&machinelearning.jpg', 1, 0, 0, 0.00, 0),
(6, 'AI and ML Introduction', 'Learn the fundamentals of AI and Machine Learning.', 2, 1, 200000.00, 15.00, '/uploads/thumbnails/ai_and_ml.jpg', 1, 0, 0, 0.00, 0),
(7, 'AI and Machine Learning Courses Overview', 'A quick overview of top-rated AI/ML courses.', 2, 1, 200000.00, 5.00, '/uploads/thumbnails/AI-And-Machine-Learning-Courses.jpg', 1, 0, 0, 0.00, 0),
(8, 'Artificial Intelligence Explained', 'Understand AI from the ground up.', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/Artificial-intelligence.jpg', 1, 0, 0, 0.00, 0),
(9, 'Top Machine Learning Courses', 'Best courses to learn ML online.', 2, 1, 200000.00, 20.00, '/uploads/thumbnails/best_machine_learning_course.webp', 1, 0, 0, 0.00, 0),
(10, 'Machine Learning Specialization', 'Specialization program in Machine Learning.', 2, 1, 200000.00, 25.00, '/uploads/thumbnails/coursera.png', 1, 0, 0, 0.00, 0),
(11, 'MAD Landscape 2024 - AI Overview', 'Exploring the MAD landscape in modern AI.', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/firstmark-mad-landscape-open-graph_purple-1.jpeg', 1, 0, 0, 0.00, 0),
(12, 'Google Machine Learning Crash Course', 'ML crash course by Google for beginners.', 2, 1, 200000.00, 0.00, '/uploads/thumbnails/Google-machine-Learning.png', 1, 0, 0, 0.00, 0),
(13, 'AI & ML in 11 Hours - Intellipaat', 'Fast-track AI & ML learning.', 2, 1, 200000.00, 30.00, '/uploads/thumbnails/intellipaat.jpg', 1, 0, 0, 0.00, 0),
(14, 'Understand the Basics of Machine Learning', 'Start your ML journey with this beginner-friendly course.', 2, 1, 200000.00, 10.00, '/uploads/thumbnails/Understand_the_Basic_of_ML.jpg', 1, 0, 0, 0.00, 0),
(16, 'Example', 'Data example', 2, 1, 5000.00, 0.00, '/uploads/thumbnails/1747271069242-832999796.png', 1, 0, 0, 0.00, 0);


INSERT INTO lessons (course_id, title, description, order_number) VALUES
(4, 'Introduction', 'Giới thiệu về khóa học Trí tuệ Nhân tạo.', 1),
(4, 'Getting Set Up', 'Cài đặt môi trường cần thiết cho khóa học.', 2),
(4, 'Vector Models and Text Preprocessing', 'Học về mô hình vector và tiền xử lý văn bản.', 3),
(4, 'Probabilistic Models (Introduction)', 'Giới thiệu về các mô hình xác suất.', 4),
(4, 'Markov Models (Intermediate)', 'Khám phá mô hình Markov ở mức trung cấp.', 5),
(4, 'Article Spinner (Intermediate)', 'Tìm hiểu cách tạo bài viết tự động ở mức trung cấp.', 6),
(4, 'Cipher Decryption (Advanced)', 'Giải mã mật mã ở cấp độ nâng cao.', 7),
(4, 'Machine Learning Models (Introduction)', 'Giới thiệu về các mô hình học máy.', 8),
(4, 'Spam Detection', 'Phát hiện thư rác bằng các kỹ thuật AI.', 9),
(4, 'Sentiment Analysis', 'Phân tích cảm xúc trong văn bản.', 10),
(4, 'Text Summarization', 'Tóm tắt văn bản bằng AI.', 11),
(4, 'Topic Modeling', 'Mô hình hóa chủ đề trong dữ liệu.', 12),
(4, 'Latent Semantic Analysis', 'Phân tích ngữ nghĩa tiềm ẩn.', 13),
(4, 'Deep Learning (Introduction)', 'Giới thiệu về học sâu.', 14),
(4, 'The Neuron', 'Hiểu về neuron trong mạng nơ-ron.', 15),
(4, 'Feedforward Artificial Neural Networks', 'Mạng nơ-ron hướng tới trước.', 16),
(4, 'Convolutional Neural Networks', 'Mạng nơ-ron tích chập.', 17),
(4, 'Recurrent Neural Networks', 'Mạng nơ-ron hồi tiếp.', 18),
(4, 'Course Conclusion', 'Kết luận khóa học.', 19),
(4, 'Setting Up Your Environment FAQ', 'Câu hỏi thường gặp về cài đặt môi trường.', 20),
(4, 'Extra Help With Python Coding for Beginners', 'Hỗ trợ lập trình Python cho người mới bắt đầu.', 21),
(4, 'Effective Learning Strategies for Machine Learning', 'Chiến lược học tập hiệu quả cho học máy.', 22),
(4, 'Appendix FAQ Finale', 'Phụ lục và câu hỏi thường gặp cuối cùng.', 23);

INSERT INTO videos (lesson_id, title, video_url)
VALUES (1, 'Giới thiệu khóa học', 'uploads/videos/1-Introduction.mp4');

INSERT INTO videos (lesson_id, title, description, video_url, order_number, is_preview) VALUES
(1, 'Vector Model', 'Learn about vector model.', 'uploads/videos/1-VectorModels', 2, FALSE);


INSERT INTO materials (lesson_id, title, file_url, file_type) VALUES

(1, 'Slide Bài Giảng Giới Thiệu NLP', 'uploads/materials/introduction-to-natural-language-processing.pdf', 'pdf'),
(1, 'Tài Liệu Tổng Quan Khóa Học', 'https://example.com/materials/nlp_course_overview.docx', 'docx'),

-- Materials cho Lesson: Getting Set Up (ví dụ lesson_id: 2)
(2, 'Hướng Dẫn Cài Đặt Môi Trường Python', 'https://example.com/materials/python_setup_guide.pdf', 'pdf'),
(2, 'Danh Sách Thư Viện Cần Cài Đặt', 'https://example.com/materials/required_libraries.txt', 'txt'),

-- Materials cho Lesson: Vector Models and Text Preprocessing (ví dụ lesson_id: 3)
(3, 'Slide: Mô Hình Vector & Tiền Xử Lý Văn Bản', 'https://example.com/materials/vector_models_slides.pdf', 'pdf'),
(3, 'Bộ Dữ Liệu Thực Hành Tiền Xử Lý', 'https://example.com/materials/text_preprocessing_data.zip', 'zip'),
(3, 'Tài Liệu Tham Khảo: Word Embeddings', 'https://example.com/materials/word_embeddings_ref.pdf', 'pdf'),

-- Materials cho Lesson: Probabilistic Models (Introduction) (ví dụ lesson_id: 4)
(4, 'Slide: Giới Thiệu Mô Hình Xác Suất', 'https://example.com/materials/probabilistic_models_intro.pdf', 'pdf'),
(4, 'Bài Tập Về Naive Bayes', 'https://example.com/materials/naive_bayes_exercises.docx', 'docx'),

-- Materials cho Lesson: Machine Learning Models (Introduction) (ví dụ lesson_id: 8)
(8, 'Slide: Các Mô Hình Học Máy', 'https://example.com/materials/ml_models_intro.pdf', 'pdf'),
(8, 'Code Mẫu: Phát Hiện Thư Rác', 'https://example.com/materials/spam_detection_code.zip', 'zip'),

-- Materials cho Lesson: Deep Learning (Introduction) (ví dụ lesson_id: 14)
(14, 'Slide: Giới Thiệu Học Sâu', 'https://example.com/materials/dl_intro_slides.pdf', 'pdf'),
(14, 'Tài Liệu Tham Khảo: Mạng Nơ-ron', 'https://example.com/materials/neural_networks_guide.pdf', 'pdf'),

-- Materials cho Lesson: The Neuron (ví dụ lesson_id: 15)
(15, 'Slide: Cấu Trúc Neuron', 'https://example.com/materials/neuron_structure_slides.pdf', 'pdf'),

-- Materials cho Lesson: Feedforward Artificial Neural Networks (ví dụ lesson_id: 16)
(16, 'Slide: Mạng Nơ-ron Hướng Tới Trước', 'https://example.com/materials/fnn_slides.pdf', 'pdf'),
(16, 'Code Mẫu: Xây Dựng FNN Đơn Giản', 'https://example.com/materials/simple_fnn_code.zip', 'zip'),

-- Materials cho Lesson: Convolutional Neural Networks (ví dụ lesson_id: 17)
(17, 'Slide: Mạng Nơ-ron Tích Chập cho Văn Bản', 'https://example.com/materials/cnn_text_slides.pdf', 'pdf'),

-- Materials cho Lesson: Recurrent Neural Networks (ví dụ lesson_id: 18)
(18, 'Slide: Mạng Nơ-ron Hồi Tiếp (RNNs)', 'https://example.com/materials/rnn_slides.pdf', 'pdf'),
(18, 'Tài Liệu Chuyên Sâu: LSTMs và GRUs', 'https://example.com/materials/lstm_gru_deep_dive.pdf', 'pdf'),
(18, 'Code Mẫu: Ứng Dụng RNN', 'https://example.com/materials/rnn_application_code.zip', 'zip'),

-- Materials cho Lesson: Course Conclusion (ví dụ lesson_id: 19)
(19, 'Tóm Tắt Khóa Học và Tài Nguyên Bổ Sung', 'https://example.com/materials/course_summary_resources.pdf', 'pdf');

INSERT INTO lessons (course_id, title, description, order_number) VALUES
-- Course ID 5: AI & Machine Learning Full Course
(5, 'Introduction to AI and ML', 'Overview of AI and Machine Learning concepts.', 1),
(5, 'Setting Up Your Environment', 'Guide to installing tools and libraries for AI/ML.', 2),
(5, 'Data Preprocessing', 'Learn techniques for cleaning and preparing data.', 3),
(5, 'Supervised Learning Basics', 'Introduction to supervised learning algorithms.', 4),
(5, 'Unsupervised Learning Basics', 'Explore unsupervised learning techniques.', 5),
(5, 'Regression Models', 'Understand regression techniques in ML.', 6),
(5, 'Classification Models', 'Learn classification algorithms and their applications.', 7),
(5, 'Decision Trees and Random Forests', 'Dive into tree-based ML models.', 8),
(5, 'Neural Networks Introduction', 'Basics of neural networks and deep learning.', 9),
(5, 'Practical Project: Predictive Modeling', 'Build a predictive model using real-world data.', 10),
(5, 'Course Wrap-Up', 'Summary and next steps for AI/ML learning.', 11),

-- Course ID 6: AI and ML Introduction
(6, 'What is AI?', 'Understand the basics of Artificial Intelligence.', 1),
(6, 'What is Machine Learning?', 'Introduction to Machine Learning concepts.', 2),
(6, 'Key Algorithms Overview', 'Explore fundamental ML algorithms.', 3),
(6, 'Applications of AI and ML', 'Real-world use cases of AI and ML.', 4),
(6, 'Tools for AI and ML', 'Introduction to tools like Python and TensorFlow.', 5),
(6, 'Course Conclusion', 'Recap and resources for further learning.', 6),

-- Course ID 7: AI and Machine Learning Courses Overview
(7, 'Introduction to AI/ML Courses', 'Overview of available AI/ML courses.', 1),
(7, 'Evaluating Course Quality', 'How to choose the right AI/ML course.', 2),
(7, 'Popular Platforms for Learning', 'Explore platforms like Coursera, Udemy, and more.', 3),
(7, 'Key Topics in AI/ML Courses', 'Core topics covered in top AI/ML courses.', 4),
(7, 'Career Paths in AI/ML', 'How courses align with AI/ML career goals.', 5),
(7, 'Conclusion and Recommendations', 'Summary and course recommendations.', 6),

-- Course ID 8: Artificial Intelligence Explained
(8, 'Introduction to AI', 'What is Artificial Intelligence and its history.', 1),
(8, 'AI Subfields', 'Explore subfields like ML, NLP, and Computer Vision.', 2),
(8, 'AI in Everyday Life', 'How AI impacts daily life and industries.', 3),
(8, 'Ethics in AI', 'Understand ethical considerations in AI development.', 4),
(8, 'Building Simple AI Models', 'Hands-on introduction to AI model creation.', 5),
(8, 'Future of AI', 'Trends and future directions in AI.', 6),
(8, 'Course Summary', 'Recap of key AI concepts.', 7),

-- Course ID 9: Top Machine Learning Courses
(9, 'Introduction to ML Courses', 'Overview of top ML courses available.', 1),
(9, 'Beginner-Friendly ML Courses', 'Best courses for ML beginners.', 2),
(9, 'Intermediate ML Courses', 'Courses for learners with some ML experience.', 3),
(9, 'Advanced ML Courses', 'Specialized courses for advanced ML topics.', 4),
(9, 'Comparing Course Platforms', 'Udemy vs. Coursera vs. others.', 5),
(9, 'Tips for Success in ML Learning', 'Strategies to excel in ML courses.', 6),
(9, 'Conclusion', 'Summary and next steps for ML learning.', 7),

-- Course ID 10: Machine Learning Specialization
(10, 'Introduction to ML Specialization', 'Overview of the ML specialization program.', 1),
(10, 'Supervised Learning Deep Dive', 'In-depth look at supervised learning techniques.', 2),
(10, 'Unsupervised Learning Deep Dive', 'Advanced unsupervised learning methods.', 3),
(10, 'Reinforcement Learning Basics', 'Introduction to reinforcement learning.', 4),
(10, 'Feature Engineering', 'Techniques for effective feature engineering.', 5),
(10, 'Model Evaluation and Tuning', 'How to evaluate and optimize ML models.', 6),
(10, 'Capstone Project', 'Apply skills in a real-world ML project.', 7),
(10, 'Specialization Conclusion', 'Summary and certification guidance.', 8),

-- Course ID 11: MAD Landscape 2024 - AI Overview
(11, 'Introduction to MAD Landscape', 'What is the MAD landscape in AI?', 1),
(11, 'Key AI Trends in 2024', 'Explore the latest trends in AI for 2024.', 2),
(11, 'AI in Business Applications', 'How AI is transforming industries.', 3),
(11, 'Emerging AI Technologies', 'New tools and frameworks in AI.', 4),
(11, 'Case Studies in AI', 'Real-world examples of AI applications.', 5),
(11, 'Future of AI in 2024', 'Predictions for AI advancements.', 6),
(11, 'Course Conclusion', 'Summary of the MAD landscape.', 7),

-- Course ID 12: Google Machine Learning Crash Course
(12, 'Introduction to ML Crash Course', 'Overview of Google’s ML crash course.', 1),
(12, 'ML Basics with TensorFlow', 'Learn ML fundamentals using TensorFlow.', 2),
(12, 'Linear Regression', 'Introduction to linear regression models.', 3),
(12, 'Logistic Regression', 'Basics of logistic regression for classification.', 4),
(12, 'Neural Networks Overview', 'Introduction to neural networks.', 5),
(12, 'Hands-On ML Lab', 'Practical exercises with Google’s ML tools.', 6),
(12, 'Course Wrap-Up', 'Summary and additional resources.', 7),

-- Course ID 13: AI & ML in 11 Hours - Intellipaat
(13, 'Introduction to Fast-Track AI/ML', 'Overview of the 11-hour AI/ML course.', 1),
(13, 'Core AI Concepts', 'Key concepts in Artificial Intelligence.', 2),
(13, 'Core ML Concepts', 'Essential Machine Learning techniques.', 3),
(13, 'Building ML Models', 'Hands-on ML model development.', 4),
(13, 'AI Applications', 'Explore real-world AI applications.', 5),
(13, 'Quick Project: ML Model', 'Build a simple ML model in hours.', 6),
(13, 'Course Conclusion', 'Summary and next steps.', 7),

-- Course ID 14: Understand the Basics of Machine Learning
(14, 'Introduction to ML Basics', 'What is Machine Learning?', 1),
(14, 'Setting Up ML Tools', 'Install Python, scikit-learn, and other tools.', 2),
(14, 'Data Exploration', 'Learn to explore and visualize data.', 3),
(14, 'Basic ML Algorithms', 'Introduction to regression and classification.', 4),
(14, 'Model Training and Testing', 'How to train and test ML models.', 5),
(14, 'Simple ML Project', 'Build a basic ML model from scratch.', 6),
(14, 'Course Summary', 'Recap and further learning resources.', 7),

-- Course ID 16: Example
(16, 'Introduction to Example Course', 'Overview of the example course.', 1),
(16, 'Basic Concepts', 'Learn the foundational concepts.', 2),
(16, 'Practical Examples', 'Hands-on examples for learning.', 3),
(16, 'Course Conclusion', 'Summary and key takeaways.', 4);

