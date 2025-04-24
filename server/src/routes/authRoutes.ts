import { Router } from 'express';
import { db } from '../index';

const router = Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'customer' } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    
    // Tạm thời sẽ mô phỏng việc tạo người dùng mới
    // Sẽ được thay thế bằng lệnh insert với Drizzle
    // Và mã hóa mật khẩu với bcrypt
    
    const newUser = {
      id: Math.floor(Math.random() * 1000),
      username,
      email,
      fullName,
      role,
      // Mật khẩu sẽ được mã hóa trước khi lưu vào DB
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Lỗi đăng ký' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
    }
    
    // Tạm thời sẽ mô phỏng việc đăng nhập thành công
    // Sẽ được thay thế bằng kiểm tra trong DB và so sánh mật khẩu với bcrypt
    
    // Cho cả khách hàng và người bán
    let sampleUser;
    if (email === 'customer@example.com') {
      sampleUser = {
        id: 1,
        username: 'customer',
        email: 'customer@example.com',
        fullName: 'Người Mua Hàng',
        role: 'customer'
      };
    } else if (email === 'seller@example.com') {
      sampleUser = {
        id: 2,
        username: 'seller',
        email: 'seller@example.com',
        fullName: 'Người Bán Hàng',
        role: 'seller'
      };
    } else {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Lưu thông tin người dùng vào session
    if (req.session) {
      req.session.user = sampleUser;
    }
    
    res.status(200).json({
      message: 'Đăng nhập thành công',
      user: sampleUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi đăng nhập' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi khi đăng xuất' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Đăng xuất thành công' });
    });
  } else {
    res.status(200).json({ message: 'Đăng xuất thành công' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    // Kiểm tra đăng nhập thông qua session
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    
    // Lấy thông tin người dùng từ session
    const user = req.session.user;
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
});

export default router;
