import { Router } from 'express';
import { db } from '../index';

const router = Router();

// GET all orders for the current user
router.get('/', async (req, res) => {
  try {
    // Kiểm tra đăng nhập
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    
    const userId = req.session.user.id;
    
    // Dữ liệu mẫu cho mục đích demo
    const sampleOrders = [
      {
        id: 1,
        userId: 1,
        status: 'delivered',
        totalAmount: 1299,
        shippingAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        paymentMethod: 'COD',
        createdAt: '2023-05-15T08:30:00.000Z',
        items: [
          {
            id: 1,
            productId: 1,
            name: 'iPhone 15 Pro Max',
            price: 1299,
            quantity: 1,
            imageUrl: '/images/iphone15promax.jpg'
          }
        ]
      },
      {
        id: 2,
        userId: 1,
        status: 'processing',
        totalAmount: 399,
        shippingAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        paymentMethod: 'Banking',
        createdAt: '2023-06-20T10:15:00.000Z',
        items: [
          {
            id: 2,
            productId: 4,
            name: 'Apple Watch Series 9',
            price: 399,
            quantity: 1,
            imageUrl: '/images/applewatchs9.jpg'
          }
        ]
      }
    ];
    
    // Trả về các đơn hàng của người dùng hiện tại
    const userOrders = sampleOrders.filter(order => order.userId === userId);
    res.status(200).json(userOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng' });
  }
});

// GET a single order by ID
router.get('/:id', async (req, res) => {
  try {
    // Kiểm tra đăng nhập
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    
    const orderId = parseInt(req.params.id);
    const userId = req.session.user.id;
    
    // Dữ liệu mẫu
    const sampleOrder = {
      id: orderId,
      userId: 1, // Đổi thành userId của người dùng hiện tại để demo
      status: 'delivered',
      totalAmount: 1299,
      shippingAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      paymentMethod: 'COD',
      createdAt: '2023-05-15T08:30:00.000Z',
      items: [
        {
          id: 1,
          productId: 1,
          name: 'iPhone 15 Pro Max',
          price: 1299,
          quantity: 1,
          imageUrl: '/images/iphone15promax.jpg'
        }
      ]
    };
    
    // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
    if (sampleOrder.userId !== userId && req.session.user.role !== 'admin' && req.session.user.role !== 'seller') {
      return res.status(403).json({ message: 'Không có quyền truy cập vào đơn hàng này' });
    }
    
    res.status(200).json(sampleOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đơn hàng' });
  }
});

// POST create a new order
router.post('/', async (req, res) => {
  try {
    // Kiểm tra đăng nhập
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    
    const userId = req.session.user.id;
    const { items, shippingAddress, paymentMethod } = req.body;
    
    // Basic validation
    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Thiếu thông tin đặt hàng' });
    }
    
    // Tính tổng tiền (thực tế sẽ lấy giá từ DB)
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Tạo đơn hàng mới (demo)
    const newOrder = {
      id: Math.floor(Math.random() * 1000),
      userId,
      status: 'pending',
      totalAmount,
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString(),
      items: items.map(item => ({
        ...item,
        id: Math.floor(Math.random() * 1000)
      }))
    };
    
    res.status(201).json({
      message: 'Đặt hàng thành công',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Lỗi khi đặt hàng' });
  }
});

// PUT update order status (primarily for sellers/admins)
router.put('/:id/status', async (req, res) => {
  try {
    // Kiểm tra đăng nhập và quyền
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    
    if (req.session.user.role !== 'seller' && req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật trạng thái đơn hàng' });
    }
    
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng không được cung cấp' });
    }
    
    // Tạm thời mô phỏng cập nhật thành công
    res.status(200).json({
      message: `Đã cập nhật trạng thái đơn hàng ${orderId} thành ${status}`,
      orderId,
      status
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
  }
});

export default router;
