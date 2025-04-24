import { Router } from 'express';
import { db } from '../index';

const router = Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    // Tạm thời chỉ lấy dữ liệu mẫu để test
    // Sẽ được thay thế bằng truy vấn Drizzle thực tế
    const sampleProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        description: 'Điện thoại cao cấp của Apple với chip A17 Pro',
        price: 1299,
        imageUrl: '/images/iphone15promax.jpg',
        category: 'smartphones',
        stock: 50,
        sellerId: 1
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Điện thoại Android cao cấp với S Pen',
        price: 1199,
        imageUrl: '/images/s24ultra.jpg',
        category: 'smartphones',
        stock: 45,
        sellerId: 2
      },
      {
        id: 3,
        name: 'Xiaomi 14 Ultra',
        description: 'Điện thoại chụp ảnh xuất sắc với hợp tác Leica',
        price: 1099,
        imageUrl: '/images/xiaomi14.jpg',
        category: 'smartphones',
        stock: 30,
        sellerId: 3
      },
      {
        id: 4,
        name: 'Apple Watch Series 9',
        description: 'Đồng hồ thông minh với chế độ theo dõi sức khỏe',
        price: 399,
        imageUrl: '/images/applewatchs9.jpg',
        category: 'wearables',
        stock: 60,
        sellerId: 1
      },
    ];
    res.status(200).json(sampleProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu sản phẩm' });
  }
});

// GET a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const sampleProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        description: 'Điện thoại cao cấp của Apple với chip A17 Pro',
        price: 1299,
        imageUrl: '/images/iphone15promax.jpg',
        category: 'smartphones',
        stock: 50,
        sellerId: 1
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Điện thoại Android cao cấp với S Pen',
        price: 1199,
        imageUrl: '/images/s24ultra.jpg',
        category: 'smartphones',
        stock: 45,
        sellerId: 2
      },
    ];
    const product = sampleProducts.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Lỗi khi tìm sản phẩm' });
  }
});

// POST create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock, sellerId } = req.body;
    
    // Validation
    if (!name || !price || !category || !sellerId) {
      return res.status(400).json({ message: 'Thiếu thông tin sản phẩm bắt buộc' });
    }
    
    // Sẽ được thay bằng lệnh insert thực tế với Drizzle
    const newProduct = { 
      id: 100, 
      name, 
      description, 
      price, 
      imageUrl, 
      category, 
      stock, 
      sellerId
    };
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm mới' });
  }
});

// PUT update a product
router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Sẽ được thay bằng lệnh update thực tế với Drizzle
    const updatedProduct = { id: productId, ...updateData };
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Sẽ được thay bằng lệnh delete thực tế với Drizzle
    res.status(200).json({ message: `Đã xóa sản phẩm ID ${productId}` });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
  }
});

// GET products by category
router.get('/category/:categoryName', async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    
    // Sẽ được thay bằng truy vấn Drizzle thực tế
    const sampleProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        description: 'Điện thoại cao cấp của Apple với chip A17 Pro',
        price: 1299,
        imageUrl: '/images/iphone15promax.jpg',
        category: 'smartphones',
        stock: 50,
        sellerId: 1
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Điện thoại Android cao cấp với S Pen',
        price: 1199,
        imageUrl: '/images/s24ultra.jpg',
        category: 'smartphones',
        stock: 45,
        sellerId: 2
      },
    ].filter(p => p.category === categoryName);
    
    res.status(200).json(sampleProducts);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm theo danh mục' });
  }
});

export default router;
