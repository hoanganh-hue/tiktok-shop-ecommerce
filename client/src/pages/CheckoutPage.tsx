import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface ShippingFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<ShippingFormData>>({});

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        // Giả lập gọi API để lấy giỏ hàng của người dùng
        const response = await axios.get('/api/cart');
        
        // Kiểm tra nếu giỏ hàng rỗng thì chuyển hướng về trang giỏ hàng
        if (response.data.length === 0) {
          navigate('/cart');
          return;
        }
        
        setCartItems(response.data);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
    
    // Lấy thông tin người dùng nếu đã đăng nhập để điền sẵn vào form
    const fetchUserProfile = async () => {
      try {
        // Giả lập gọi API để lấy thông tin người dùng
        const response = await axios.get('/api/auth/me');
        const userProfile = response.data;
        
        // Điền sẵn các thông tin của người dùng vào form nếu có
        if (userProfile) {
          setFormData(prevData => ({
            ...prevData,
            fullName: userProfile.fullName || '',
            phoneNumber: userProfile.phoneNumber || '',
            address: userProfile.address || '',
            city: userProfile.city || '',
            district: userProfile.district || '',
            ward: userProfile.ward || ''
          }));
        }
      } catch (err) {
        // Không cần xử lý lỗi ở đây, vì có thể người dùng chưa đăng nhập
        console.log('User not logged in or error fetching profile');
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateShippingFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 1000 ? 0 : 30; // Miễn phí vận chuyển cho đơn hàng trên $1000
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShippingFee();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng nhập lại
    if (formErrors[name as keyof ShippingFormData]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ShippingFormData> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    if (!formData.district.trim()) {
      errors.district = 'Vui lòng chọn quận/huyện';
    }
    
    if (!formData.ward.trim()) {
      errors.ward = 'Vui lòng chọn phường/xã';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Hiển thị thông báo nếu form không hợp lệ
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Tạo địa chỉ giao hàng đầy đủ
      const shippingAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      
      // Gọi API tạo đơn hàng mới
      const response = await axios.post('/api/orders', {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        note: formData.note
      });
      
      // Chuyển đến trang xác nhận đơn hàng với ID đơn hàng vừa tạo
      navigate(`/order-confirmation/${response.data.order.id}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Thông tin giao hàng */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmitOrder}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {formErrors.fullName && <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phoneNumber">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="">Chọn Tỉnh/TP</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    {/* Thêm các tỉnh thành khác */}
                  </select>
                  {formErrors.city && <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="district">
                    Quận/Huyện *
                  </label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.district ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {formData.city === 'Hà Nội' && (
                      <>
                        <option value="Hai Bà Trưng">Hai Bà Trưng</option>
                        <option value="Hoàn Kiếm">Hoàn Kiếm</option>
                        <option value="Đống Đa">Đống Đa</option>
                      </>
                    )}
                    {formData.city === 'TP. Hồ Chí Minh' && (
                      <>
                        <option value="Quận 1">Quận 1</option>
                        <option value="Quận 2">Quận 2</option>
                        <option value="Quận 3">Quận 3</option>
                      </>
                    )}
                    {/* Thêm các quận/huyện khác tương ứng với tỉnh/thành phố */}
                  </select>
                  {formErrors.district && <p className="mt-1 text-sm text-red-500">{formErrors.district}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ward">
                    Phường/Xã *
                  </label>
                  <select
                    id="ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.ward ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {formData.district === 'Hai Bà Trưng' && (
                      <>
                        <option value="Bạch Đằng">Bạch Đằng</option>
                        <option value="Bùi Thị Xuân">Bùi Thị Xuân</option>
                      </>
                    )}
                    {formData.district === 'Quận 1' && (
                      <>
                        <option value="Bến Nghé">Bến Nghé</option>
                        <option value="Bến Thành">Bến Thành</option>
                      </>
                    )}
                    {/* Thêm các phường/xã tương ứng với quận/huyện */}
                  </select>
                  {formErrors.ward && <p className="mt-1 text-sm text-red-500">{formErrors.ward}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="note">
                  Ghi chú
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng hoặc hướng dẫn giao hàng chi tiết"
                />
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="cod" className="ml-2 text-gray-700">
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="banking"
                  name="paymentMethod"
                  value="banking"
                  checked={paymentMethod === 'banking'}
                  onChange={() => setPaymentMethod('banking')}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="banking" className="ml-2 text-gray-700">
                  Chuyển khoản ngân hàng
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="momo"
                  name="paymentMethod"
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={() => setPaymentMethod('momo')}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="momo" className="ml-2 text-gray-700">
                  Ví điện tử MoMo
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="vnpay"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="vnpay" className="ml-2 text-gray-700">
                  VNPay
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tổng đơn hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng</h2>
            
            <div className="max-h-64 overflow-y-auto mb-4">
              <ul className="divide-y">
                {cartItems.map(item => (
                  <li key={item.id} className="py-3 flex justify-between">
                    <div className="flex items-center">
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded mr-3" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-500 text-sm">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>
                  {calculateShippingFee() === 0 ? (
                    'Miễn phí'
                  ) : (
                    `$${calculateShippingFee().toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                <span>Tổng cộng:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white text-lg font-medium py-3 rounded-md mt-6 transition duration-300`}
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
