import axiosInstance from "../config/axios";
import { ApiResponse, Cart, CartItem } from "../types/types";

export const getCart = async (): Promise<Cart | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Cart>>("/cart");
    console.log("Get cart response:", response.data);

    let cartData: Cart | null = null;
    if (response.data.data) {
      cartData = response.data.data as Cart;
    } else if (response.data && "items" in response.data) {
      cartData = response.data as Cart;
    }

    if (!cartData || !cartData.items) {
      console.warn("No valid cart data found in response:", response.data);
      return { items: [], total: 0 };
    }

    cartData.items = cartData.items.map((item: CartItem) => ({
      ...item,
      course_id: Number(item.course_id),
      price: Number(item.price),
      discounted_price: item.discounted_price ? Number(item.discounted_price) : undefined,
    }));

    // Tính tổng tiền
    const subtotal = cartData.items.reduce((sum, item) => {
      const price = Number(item.price);
      const discountedPrice = item.discounted_price ? Number(item.discounted_price) : price;
      return sum + (discountedPrice || price);
    }, 0);
    cartData.total = Number(subtotal.toFixed(2));

    return cartData;
  } catch (error: any) {
    console.error("Get cart error details:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || "Failed to fetch cart");
  }
};

export const addToCart = async (course_id: number): Promise<void> => {
  try {
    if (!course_id || typeof course_id !== "number" || course_id <= 0) {
      throw new Error("ID khóa học không hợp lệ");
    }
    console.log("Sending add to cart request with course_id:", course_id);
    const response = await axiosInstance.post("/cart/items", { course_id });
    console.log("Add to cart response:", response.data);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to add to cart";
    console.error("Add to cart error details:", {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(errorMessage);
  }
};

export const removeFromCart = async (course_id: number): Promise<void> => {
  try {
    if (!course_id || typeof course_id !== "number" || course_id <= 0) {
      throw new Error("ID khóa học không hợp lệ");
    }
    console.log("Sending remove from cart request with course_id:", course_id);
    const response = await axiosInstance.delete(`/cart/items/${course_id}`); // Sửa endpoint
    console.log("Remove from cart response:", response.data);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Không thể xóa khóa học khỏi giỏ hàng");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa khóa học khỏi giỏ hàng";
    console.error("Remove from cart error details:", {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(errorMessage);
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    console.log("Sending clear cart request");
    const response = await axiosInstance.delete("/cart");
    console.log("Clear cart response:", response.data);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to clear cart");
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to clear cart";
    console.error("Clear cart error details:", {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(errorMessage);
  }
};