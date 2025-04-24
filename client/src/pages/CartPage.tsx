import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/cart');
        setCartItems(response.data);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    if (newQuantity > item.stock) {
      alert(`Chỉ còn ${item.stock} sản phẩm trong kho`);
      return;
    }

    try {
      await axios.put(`/api/cart/${itemId}`, { quantity: newQuantity });
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Có lỗi xảy ra khi cập nhật số lượng. Vui lòng thử lại!');
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại!');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiến hành mua sắm</p>
            <Link 
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition duration-300"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách sản phẩm trong giỏ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4">Sản phẩm</th>
                    <th className="text-center py-4">Đơn giá</th>
                    <th className="text-center py-4">Số lượng</th>
                    <th className="text-right py-4">Tổng</th>
                    <th className="text-right py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded mr-4" 
                          />
                          <Link to={`/product/${item.productId}`} className="hover:text-blue-600">
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        </div>
                      </td>
                      <td className="text-center py-4">${item.price.toFixed(2)}</td>
                      <td className="py-4">
                        <div className="flex justify-center">
                          <div className="flex border rounded-md">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 border-r text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="w-12 text-center py-1">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 border-l text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity >= item.stock}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="text-right py-4">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <Link to="/" className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
        
        {/* Tổng giỏ hàng */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tổng giỏ hàng</h2>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>Được tính khi thanh toán</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                <span>Tổng cộng:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 rounded-md mt-6 transition duration-300"
              >
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
