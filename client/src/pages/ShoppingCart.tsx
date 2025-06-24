import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCart, removeFromCart, clearCart } from "../services/CartService";
import { Cart, CartItem } from "../types/types";

const ShoppingCart: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [clearing, setClearing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      const cartData = await getCart();
      console.log("Fetched cart data:", cartData);
      if (!cartData) {
        setCart({ items: [] });
      } else {
        setCart({
          id: cartData.id ?? 0,
          user_id: cartData.user_id ?? 0,
          items: cartData.items || [],
          created_at: cartData.created_at,
          updated_at: cartData.updated_at,
        });
      }
    } catch (err) {
      setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      console.error("Failed to fetch cart:", err);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [location]);

  const handleRemove = async (course_id: number | string) => {
    try {
      const parsedCourseId = Number(course_id);
      if (isNaN(parsedCourseId) || parsedCourseId <= 0) {
        throw new Error("ID khóa học không hợp lệ");
      }
      console.log("Attempting to remove course with ID:", parsedCourseId);
      await removeFromCart(parsedCourseId);
      setSuccessMessage("Đã xóa khóa học khỏi giỏ hàng thành công!");
      await fetchCart();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      const errorMsg = err.message || "Không thể xóa khóa học khỏi giỏ hàng.";
      setError(errorMsg);
      console.error("Remove from cart error:", err);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      console.log("Attempting to clear cart");
      const response = await clearCart();
      console.log("Clear cart response:", response);
      setSuccessMessage("Đã làm trống giỏ hàng thành công!");
      await fetchCart();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Không thể làm trống giỏ hàng.";
      setError(errorMsg);
      console.error("Clear cart error:", {
        message: errorMsg,
        response: err.response?.data,
      });
      setTimeout(() => setError(""), 3000);
    } finally {
      setClearing(false);
    }
  };

  const subtotal = cart?.items?.reduce((total, item: CartItem) => {
    const price = Number(item.price);
    const discountedPrice = item.discounted_price ? Number(item.discounted_price) : price;
    return total + (discountedPrice || price);
  }, 0) || 0;

  return (
    <div className="max-w-5xl max-lg:max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Shopping Cart</h1>

      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md shadow-md z-50 bg-green-100 text-green-600">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md shadow-md z-50 bg-red-100 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg text-gray-500">Đang tải giỏ hàng...</p>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg text-gray-500">Giỏ hàng của bạn trống.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 lg:gap-x-8 gap-x-6 gap-y-8 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item: CartItem) => (
              <div
                key={item.course_id}
                className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900">{item.course_title}</h3>
                  <p className="text-sm text-slate-500">Mã khóa học: {item.course_id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {item.discounted_price && Number(item.discounted_price) < Number(item.price) ? (
                      <>
                        <span className="line-through text-gray-500 mr-2">
                          ${Number(item.price).toFixed(2)}
                        </span>
                        <span>${Number(item.discounted_price).toFixed(2)}</span>
                      </>
                    ) : (
                      <span>${Number(item.price).toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(item.course_id)}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <ul className="text-slate-500 font-medium space-y-4 text-sm">
              <li className="flex justify-between">
                Tạm tính <span className="text-slate-900 font-semibold">${subtotal.toFixed(2)}</span>
              </li>
              <hr className="border-slate-300" />
                <li className="flex justify-between font-semibold text-slate-900 text-base">
                  Tổng cộng <span>{Math.round(subtotal).toLocaleString("vi-VN")} VND</span>
                </li>
            </ul>

            <div className="mt-6 space-y-4">
              <button
                type="button"
                className="w-full px-4 py-2.5 text-sm font-medium bg-slate-800 hover:bg-slate-900 text-white rounded-md transition-colors"
                onClick={() => navigate("/checkout")}
              >
                Mua ngay
              </button>
              <button
                onClick={handleClear}
                type="button"
                disabled={clearing}
                className={`w-full px-4 py-2.5 text-sm font-medium ${
                  clearing ? "bg-gray-400" : "bg-slate-100 hover:bg-slate-200"
                } text-slate-900 border border-gray-300 rounded-md transition-colors`}
              >
                {clearing ? "Đang làm trống..." : "Làm trống giỏ hàng"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <img src="https://readymadeui.com/images/master.webp" alt="Mastercard" className="w-10 object-contain" />
              <img src="https://readymadeui.com/images/visa.webp" alt="Visa" className="w-10 object-contain" />
              <img
                src="https://readymadeui.com/images/american-express.webp"
                alt="American Express"
                className="w-10 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;