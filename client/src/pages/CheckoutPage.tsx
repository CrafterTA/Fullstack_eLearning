import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCart } from "../services/CartService";
import axiosInstance from "../config/axios";
import { CartItem } from "../types/types";

type CartState = {
  items: CartItem[];
  total: number;
};
const CheckoutPage: React.FC = () => {
  const [cart, setCart] = useState<CartState>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu giỏ hàng
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const cartData = await getCart();
        if (!cartData || !cartData.items) {
          setCart({ items: [], total: 0 });
          return;
        }
        const subtotal = cartData.items.reduce((sum, item) => {
          const price = Number(item.price);
          const discountedPrice = item.discounted_price ? Number(item.discounted_price) : price;
          return sum + (discountedPrice || price);
        }, 0);
        setCart({ items: cartData.items, total: Number(subtotal.toFixed(2)) });
      } catch (err) {
        setError("Không thể tải giỏ hàng");
        setCart({ items: [], total: 0 });
      }
    };
    fetchCartData();
  }, []);

  // Xử lý trạng thái sau khi quay lại từ PayOS
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status === "success") {
      setSuccessMessage("Thanh toán thành công! Bạn sẽ được chuyển hướng...");
      setTimeout(() => navigate("/"), 3000);
    } else if (status === "cancel") {
      setError("Thanh toán đã bị hủy.");
      setTimeout(() => navigate("/checkout"), 3000);
    }
  }, [location, navigate]);

  // Hàm tạo thanh toán qua PayOS
  const handlePayOSPayment = async () => {
    if (cart.items.length === 0) {
      setError("Giỏ hàng trống. Vui lòng thêm khóa học trước khi thanh toán.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/payments/payos", {
        payment_method: "Bank Transfer",
      });
      const { paymentLink } = response.data;
      if (!paymentLink) {
        throw new Error("Không thể tạo link thanh toán");
      }
      window.location.href = paymentLink; // Chuyển hướng đến trang PayOS
    } catch (err) {
        if (err && typeof err === "object" && "response" in err) {
            setError((err as any).response?.data?.message || "Lỗi khi tạo thanh toán");
        } else {
            setError("Lỗi khi tạo thanh toán");
        }
        setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white sm:px-8 px-4 py-6">
      <div className="max-w-screen-xl max-md:max-w-xl mx-auto">
        {/* Progress Bar */}
        <div className="flex items-start mb-16">
          <div className="w-full">
            <div className="flex items-center w-full">
              <div className="w-8 h-8 shrink-0 mx-[-1px] bg-blue-600 p-1.5 flex items-center justify-center rounded-full">
                <span className="text-sm text-white font-semibold">1</span>
              </div>
              <div className="w-full h-[3px] mx-4 rounded-lg bg-blue-600"></div>
            </div>
            <div className="mt-2 mr-4">
              <h6 className="text-sm font-semibold text-slate-900">Cart</h6>
            </div>
          </div>
          <div className="w-full">
            <div className="flex items-center w-full">
              <div className="w-8 h-8 shrink-0 mx-[-1px] bg-blue-600 p-1.5 flex items-center justify-center rounded-full">
                <span className="text-sm text-white font-semibold">2</span>
              </div>
              <div className="w-full h-[3px] mx-4 rounded-lg bg-slate-300"></div>
            </div>
            <div className="mt-2 mr-4">
              <h6 className="text-sm font-semibold text-slate-900">Checkout</h6>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <div className="w-8 h-8 shrink-0 mx-[-1px] bg-slate-300 p-1.5 flex items-center justify-center rounded-full">
                <span className="text-sm text-white font-semibold">3</span>
              </div>
            </div>
            <div className="mt-2">
              <h6 className="text-sm font-semibold text-slate-400">Order</h6>
            </div>
          </div>
        </div>

        {/* Thông báo */}
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 lg:gap-x-12">
          <div className="lg:col-span-2">
            <form>
              <div className="mt-12">
                <h2 className="text-xl text-slate-900 font-semibold mb-6">Payment</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="bg-gray-100 p-4 rounded-md border border-gray-300 max-w-sm">
                    <div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="method"
                          className="w-5 h-5 cursor-pointer"
                          id="card"
                          disabled
                        />
                        <label htmlFor="card" className="ml-4 flex gap-2 cursor-pointer">
                          <img src="https://readymadeui.com/images/visa.webp" className="w-12" alt="card1" />
                          <img src="https://readymadeui.com/images/american-express.webp" className="w-12" alt="card2" />
                          <img src="https://readymadeui.com/images/master.webp" className="w-12" alt="card3" />
                        </label>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 font-medium">
                      Pay with your debit or credit card (Chưa hỗ trợ)
                    </p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-md border border-gray-300 max-w-sm">
                    <div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="method"
                          className="w-5 h-5 cursor-pointer"
                          id="payos"
                          checked
                          onChange={() => {}} // Đảm bảo PayOS được chọn mặc định
                        />
                        <label htmlFor="payos" className="ml-4 flex gap-2 cursor-pointer">
                          <span>PayOS (Bank Transfer)</span>
                        </label>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 font-medium">
                      Pay with bank transfer via PayOS
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 max-w-md">
                <p className="text-slate-900 text-sm font-medium mb-2">Do you have a promo code?</p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600"
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center font-medium tracking-wide bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-md text-sm text-white cursor-pointer"
                    onClick={() => alert("Chức năng áp dụng mã giảm giá chưa được triển khai!")}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="relative">
            <h2 className="text-xl text-slate-900 font-semibold mb-6">Order Summary</h2>
            <ul className="text-slate-500 font-medium space-y-4">
              <li className="flex flex-wrap gap-4 text-sm">
                Subtotal <span className="ml-auto font-semibold text-slate-900">${cart.total.toFixed(2)}</span>
              </li>
              <li className="flex flex-wrap gap-4 text-sm">
                Discount <span className="ml-auto font-semibold text-slate-900">$0.00</span>
              </li>
              <hr className="border-slate-300" />
                <li className="flex flex-wrap gap-4 text-[15px] font-semibold text-slate-900">
                Total <span className="ml-auto">{Math.round(cart.total).toLocaleString("vi-VN")} VND</span>
                </li>
            </ul>
            <div className="space-y-4 mt-8">
              <button
                type="button"
                onClick={handlePayOSPayment}
                disabled={loading || cart.items.length === 0}
                className={`rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide ${
                  loading || cart.items.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors`}
              >
                {loading ? "Đang xử lý..." : "Complete Purchase with PayOS"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide bg-gray-100 hover:bg-gray-200 border border-gray-300 text-slate-900 cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;