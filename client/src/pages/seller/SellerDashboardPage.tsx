import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  returningCustomers: number;
  productCategories: { name: string; count: number }[];
  recentOrders: {
    id: number;
    customer: string;
    amount: number;
    date: string;
    status: string;
  }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

const SellerDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/seller/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error || !stats) {
    return <div className="text-red-600 text-center p-4">{error || 'Có lỗi xảy ra khi tải dữ liệu'}</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Lấy ngày hiện tại để hiển thị trên dashboard
  const today = new Date();
  const formattedDate = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Sản phẩm sắp hết hàng (giả lập)
  const lowStockProducts = [
    { id: 1, name: 'iPhone 15 Pro Max', stock: 5, status: 'low' },
    { id: 4, name: 'Apple Watch Series 9', stock: 3, status: 'low' },
    { id: 7, name: 'AirPods Pro 2', stock: 2, status: 'critical' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
          <p className="text-gray-600">{formattedDate}</p>
        </div>
        <Link 
          to="/seller/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
        >
          + Thêm sản phẩm mới
        </Link>
      </header>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-md p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-600">Tổng sản phẩm</h2>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-md p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-600">Doanh thu</h2>
              <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-md p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-600">Tổng đơn hàng</h2>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-md p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-600">Đơn hàng đang xử lý</h2>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Biểu đồ doanh thu theo tháng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Doanh thu theo tháng</h2>
          <div className="h-80">
            <div className="flex items-end h-64 space-x-2">
              {stats.monthlyRevenue.map((item, index) => {
                // Tính chiều cao tương đối của cột
                const maxRevenue = Math.max(...stats.monthlyRevenue.map(i => i.revenue));
                const height = (item.revenue / maxRevenue) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full">
                      <div 
                        className="bg-blue-500 hover:bg-blue-600 transition-all rounded-t" 
                        style={{ height: `${height}%` }}
                        title={`${item.month}: $${item.revenue}`}
                      ></div>
                    </div>
                    <div className="text-xs mt-2">{item.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Đơn hàng gần đây */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Đơn hàng gần đây</h2>
            <Link to="/seller/orders" className="text-blue-600 hover:underline text-sm">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">#</th>
                  <th className="pb-3">Khách hàng</th>
                  <th className="pb-3">Giá trị</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">#{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3">${order.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sản phẩm theo danh mục */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm theo danh mục</h2>
          <div className="space-y-4">
            {stats.productCategories.map((category, index) => {
              const totalProducts = stats.productCategories.reduce(
                (sum, cat) => sum + cat.count, 0
              );
              const percentage = Math.round((category.count / totalProducts) * 100);
              
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.count} sản phẩm ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sản phẩm sắp hết hàng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm sắp hết hàng</h2>
          {lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3">Sản phẩm</th>
                    <th className="pb-3">Kho</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3">{product.stock}</td>
                      <td className="py-3">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${product.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {product.status === 'critical' ? 'Gần hết' : 'Thấp'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link to={`/seller/products/${product.id}/edit`} className="text-blue-600 hover:underline">
                          Cập nhật
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Không có sản phẩm nào sắp hết hàng.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
