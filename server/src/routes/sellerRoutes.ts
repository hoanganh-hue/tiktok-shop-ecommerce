import { Router } from 'express';
import { db } from '../index';

const router = Router();

// Middleware kiểm tra quyền seller
const checkSellerRole = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  
  if (req.session.user.role !== 'seller' && req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
  
  next();
};

// Áp dụng middleware cho tất cả các routes
router.use(checkSellerRole);

// GET statistics for seller dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const sellerId = req.session.user.id;
    
    // Dữ liệu mẫu cho thống kê
    const stats = {
      totalProducts: 15,
      totalOrders: 42,
      totalRevenue: 15750,
      pendingOrders: 3,
      returningCustomers: 8,
      productCategories: [
        { name: 'smartphones', count: 8 },
        { name: 'wearables', count: 4 },
        { name: 'accessories', count: 3 }
      ],
      recentOrders: [
        {
          id: 101,
          customer: 'Nguyễn Văn A',
          amount: 1299,
          date: '2023-06-15T10:30:00Z',
          status: 'delivered'
        },
        {
          id: 102,
          customer: 'Trần Thị B',
          amount: 399,
          date: '2023-06-18T14:45:00Z',
          status: 'processing'
        },
        {
          id: 103,
          customer: 'Lê Văn C',
          amount: 2498,
          date: '2023-06-20T09:15:00Z',
          status: 'pending'
        }
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1800 },
        { month: 'Mar', revenue: 2400 },
        { month: 'Apr', revenue: 1600 },
        { month: 'May', revenue: 3200 },
        { month: 'Jun', revenue: 2800 }
      ]
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching seller dashboard data:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu dashboard' });
  }
});

// GET seller's products
router.get('/products', async (req, res) => {
  try {
    const sellerId = req.session.user.id;
    
    // Dữ liệu mẫu sản phẩm của người bán
    const products = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        description: 'Điện thoại cao cấp của Apple với chip A17 Pro',
        price: 1299,
        imageUrl: '/images/iphone15promax.jpg',
        category: 'smartphones',
        stock: 50,
        sellerId: 2, // Đổi thành sellerId của người dùng hiện tại cho demo
        sales: 28,
        rating: 4.8
      },
      {
        id: 4,
        name: 'Apple Watch Series 9',
        description: 'Đồng hồ thông minh với chế độ theo dõi sức khỏe',
        price: 399,
        imageUrl: '/images/applewatchs9.jpg',
        category: 'wearables',
        stock: 60,
        sellerId: 2, // Đổi thành sellerId của người dùng hiện tại cho demo
        sales: 42,
        rating: 4.7
      },
      {
        id: 7,
        name: 'AirPods Pro 2',
        description: 'Tai nghe không dây với chống ồn chu động',
        price: 249,
        imageUrl: '/images/airpodspro2.jpg',
        category: 'accessories',
        stock: 75,
        sellerId: 2, // Đổi thành sellerId của người dùng hiện tại cho demo
        sales: 63,
        rating: 4.6
      }
    ];
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm của bạn' });
  }
});

// GET seller's orders
router.get('/orders', async (req, res) => {
  try {
    const sellerId = req.session.user.id;
    
    // Dữ liệu mẫu đơn hàng cho người bán
    const orders = [
      {
        id: 101,
        customerId: 5,
        customerName: 'Nguyễn Văn A',
        status: 'delivered',
        totalAmount: 1299,
        orderDate: '2023-06-15T10:30:00Z',
        items: [
          {
            id: 1,
            productId: 1,
            name: 'iPhone 15 Pro Max',
            price: 1299,
            quantity: 1
          }
        ]
      },
      {
        id: 102,
        customerId: 6,
        customerName: 'Trần Thị B',
        status: 'processing',
        totalAmount: 399,
        orderDate: '2023-06-18T14:45:00Z',
        items: [
          {
            id: 2,
            productId: 4,
            name: 'Apple Watch Series 9',
            price: 399,
            quantity: 1
          }
        ]
      },
      {
        id: 103,
        customerId: 7,
        customerName: 'Lê Văn C',
        status: 'pending',
        totalAmount: 2498,
        orderDate: '2023-06-20T09:15:00Z',
        items: [
          {
            id: 3,
            productId: 1,
            name: 'iPhone 15 Pro Max',
            price: 1299,
            quantity: 1
          },
          {
            id: 4,
            productId: 4,
            name: 'Apple Watch Series 9',
            price: 399,
            quantity: 3
          }
        ]
      }
    ];
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng' });
  }
});

// GET seller's wallet/earnings
router.get('/wallet', async (req, res) => {
  try {
    const sellerId = req.session.user.id;
    
    // Dữ liệu mẫu ví/thu nhập của người bán
    const wallet = {
      balance: 12580,
      pendingBalance: 3170,
      totalRevenue: 15750,
      withdrawals: [
        {
          id: 'W1001',
          amount: 5000,
          status: 'completed',
          date: '2023-05-28T14:30:00Z',
          method: 'Bank Transfer',
          accountDetails: 'Vietcombank ****3456'
        },
        {
          id: 'W1002',
          amount: 3500,
          status: 'completed',
          date: '2023-06-10T09:45:00Z',
          method: 'Bank Transfer',
          accountDetails: 'Vietcombank ****3456'
        }
      ],
      transactions: [
        {
          id: 'T2001',
          orderId: 101,
          amount: 1299,
          type: 'sale',
          status: 'completed',
          date: '2023-06-15T10:30:00Z'
        },
        {
          id: 'T2002',
          orderId: 102,
          amount: 399,
          type: 'sale',
          status: 'pending',
          date: '2023-06-18T14:45:00Z'
        },
        {
          id: 'T2003',
          orderId: 103,
          amount: 2498,
          type: 'sale',
          status: 'pending',
          date: '2023-06-20T09:15:00Z'
        },
        {
          id: 'T2004',
          withdrawalId: 'W1001',
          amount: -5000,
          type: 'withdrawal',
          status: 'completed',
          date: '2023-05-28T14:30:00Z'
        },
        {
          id: 'T2005',
          withdrawalId: 'W1002',
          amount: -3500,
          type: 'withdrawal',
          status: 'completed',
          date: '2023-06-10T09:45:00Z'
        }
      ]
    };
    
    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error fetching seller wallet:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin ví/thu nhập' });
  }
});

export default router;
