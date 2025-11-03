# 🎓 Fullstack E-Learning Platform

A comprehensive e-learning platform built with React, Node.js, Express, and MySQL. This platform provides a complete learning management system with course management, payment integration, and user authentication.

## ✨ Features

### 👨‍🎓 Student Features
- 🔐 User authentication (Email/Password & Google OAuth)
- 📚 Browse and search courses
- 🛒 Shopping cart and checkout
- 💳 Secure payment integration (PayOS)
- 📖 Course enrollment and progress tracking
- 🎥 Video lessons with PDF materials
- ⭐ Course reviews and ratings
- 👤 User profile management
- 📊 Personal learning dashboard

### 👨‍💼 Admin Features
- 📈 Admin dashboard with analytics
- 📝 Course management (CRUD operations)
- 🏷️ Category management
- 👥 User management
- 💰 Payment tracking
- 📊 Review management

### 🔧 Technical Features
- 🎨 Modern UI with Tailwind CSS & shadcn/ui
- 🔒 Secure authentication with JWT
- 📧 Email notifications
- ☁️ Firebase integration
- 🐳 Docker support for easy deployment
- 🧪 Jest testing setup
- 📱 Responsive design

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 19** - UI framework
- 🚀 **Vite** - Build tool
- 🎨 **Tailwind CSS 4** - Styling
- 🎭 **shadcn/ui** - UI components
- 🔄 **Redux Toolkit** - State management
- 🌐 **React Router** - Navigation
- 📊 **Chart.js** - Data visualization
- 🎬 **React Player** - Video playback
- 📄 **React PDF** - PDF viewer

### Backend
- 🟢 **Node.js** - Runtime environment
- 🚂 **Express** - Web framework
- 🗄️ **MySQL** - Database
- 🔑 **JWT** - Authentication
- 📧 **Nodemailer** - Email service
- 💳 **PayOS** - Payment gateway
- ☁️ **Firebase Admin** - Additional services
- 📤 **Multer** - File uploads

### DevOps
- 🐳 **Docker** - Containerization
- 🐙 **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

Before you begin, ensure you have installed:
- 📦 **Node.js** (v18 or higher)
- 🐳 **Docker** and **Docker Compose** (for containerized deployment)
- 🗄️ **MySQL** (v8.0 or higher) - if running locally without Docker

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CrafterTA/Fullstack_eLearning.git
cd Fullstack_eLearning
```

### 2. Environment Configuration

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=defaultdb

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# PayOS
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# URLs
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
PORT=3000
```

### 3. Firebase Configuration

Place your Firebase Admin SDK JSON file in:
```
server/src/config/elearningsa-bca0b-firebase-adminsdk.json
```

### 4. Database Setup

Import the database schema:

```bash
mysql -u root -p < server/doancs.sql
```

## 🐳 Running with Docker (Recommended)

### Start all services:

```bash
docker-compose up -d
```

This will start:
- 🌐 **Frontend** on http://localhost:5173
- 🔌 **Backend API** on http://localhost:3000
- 🗄️ **MySQL Database** on localhost:3306

### Stop services:

```bash
docker-compose down
```

### View logs:

```bash
docker-compose logs -f
```

## 💻 Running Locally (Development)

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

The API will be available at http://localhost:3000

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:5173

## 🧪 Running Tests

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## 📁 Project Structure

```
Fullstack_eLearning/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context
│   │   ├── config/        # Configuration files
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── uploads/           # File uploads
│   └── tests/             # Test files
│
└── docker-compose.yml     # Docker orchestration
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:id` - Remove from cart

### Payments
- `POST /api/payments/create` - Create payment
- `GET /api/payments/verify/:id` - Verify payment

### Enrollments
- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in course

### Reviews
- `GET /api/reviews/:courseId` - Get course reviews
- `POST /api/reviews` - Create review

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Environment variable protection
- ✅ SQL injection prevention
- ✅ File upload validation
- ✅ Rate limiting ready

## 📧 Email Configuration

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASSWORD`

## 💳 Payment Integration

This platform uses PayOS for payment processing. You need to:
1. Register at [PayOS](https://payos.vn/)
2. Get your API credentials
3. Add them to your `.env` file

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- **CrafterTA** - [GitHub Profile](https://github.com/CrafterTA)

## 🙏 Acknowledgments

- Thanks to all contributors
- UI components from shadcn/ui
- Icons from Heroicons and Lucide React

## 📞 Support

For support, email hoangthaianh397@gmail.com or create an issue in the repository.

---

Made with ❤️ by CrafterTA
