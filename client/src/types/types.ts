
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'User' | 'Instructor' | 'Admin';
  avatar: string | null;
  is_active: number; 
  email_verified?: number;
  created_at: string;
  updated_at: string;
}


export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  category_id: number;
  created_by: number;
  price: number;
  discount_percentage?: number;
  discounted_price?: number;
  thumbnail_url?: string;
  is_active?: boolean;
  views?: number;
  total_students?: number;
  rating?: number;
  total_ratings?: number;
  created_at?: string;
  updated_at?: string;
  lessons?: Lesson[];
  avg_rating?: number;
}

export interface LectureProgress {
  id: string; 
  videoUrl: string;
  progressValue?: number;
  materialUrl?: string;
  title?: string; 
}
export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order_number?: number; 
  videos?: Video[];
  materials?: Material[];
  created_at?: string; 
  updated_at?: string; 
}

export interface Video {
  id: number;
  lesson_id: number;
  title: string;
  description?: string;
  video_url: string;
  order_number?: number; 
  duration?: number;
  is_preview?: boolean;
  created_at?: string;
  updated_at?: string; 
}


export interface Material {
  id: number;
  lesson_id: number;
  title: string;
  file_url: string;
  file_type: string;
  created_at?: string;
  updated_at?: string; 
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  title: string;
  thumbnail_url?: string;
  price: number;
  discounted_price?: number;
  description?: string;
}

export interface Payment {
  id: number;
  user_id: number;
  cart_id: number;
  payment_method: string;
  amount: number;
  status: 'Pending' | 'Success' | 'Failed';
  transaction_id?: string;
  payment_date?: string;
}
export interface PaymentStat {
  month: string;
  income: number;
  transactions: number;
}


export interface Review {
  id: number;
  user_id: number;
  course_id: number;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at?: string;
  full_name?: string;
}

// Cart
export interface Cart {
  id?: number;
  user_id?: number; 
  items: CartItem[];
  created_at?: string; 
  updated_at?: string; 
  total?: number; // Tổng tiền của giỏ hàng
}
export interface CartItem {
  course_id: number;
  course_title: string;
  price: number | string; 
  discounted_price?: number | string; 
}

// types.ts
export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      full_name: string;
      role: string;
    };
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: number; 
}