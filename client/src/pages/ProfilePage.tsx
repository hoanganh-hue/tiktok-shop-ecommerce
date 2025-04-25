import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  avatar?: string;
  role: string;
}

interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'addresses'
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState<Partial<ProfileFormData>>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
        
        // Cập nhật formData với thông tin từ API
        setFormData(prev => ({
          ...prev,
          fullName: response.data.fullName || '',
          phoneNumber: response.data.phoneNumber || '',
          address: response.data.address || '',
          city: response.data.city || '',
          district: response.data.district || '',
          ward: response.data.ward || ''
        }));
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Xóa lỗi khi người dùng nhập lại
    if (formErrors[name as keyof ProfileFormData]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    
    // Xóa thông báo thành công khi người dùng thay đổi input
    if (success) setSuccess(null);
  };

  // Xác thực biểu mẫu thông tin cá nhân
  const validateProfileForm = (): boolean => {
    const errors: Partial<ProfileFormData> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ tên không được để trống';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xác thực biểu mẫu đổi mật khẩu
  const validatePasswordForm = (): boolean => {
    const errors: Partial<ProfileFormData> = {};
    
    if (!formData.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!formData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      errors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Cập nhật thông tin hồ sơ
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      const response = await axios.put('/api/auth/profile', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        ward: formData.ward
      });
      
      // Cập nhật thông tin người dùng trong state
      setUser(response.data);
      setSuccess('Cập nhật thông tin cá nhân thành công!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setUpdating(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      await axios.put('/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      // Reset form sau khi đổi mật khẩu thành công
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
      setSuccess('Đổi mật khẩu thành công!');
    } catch (err: any) {
      console.error('Error changing password:', err);
      if (err.response && err.response.status === 400) {
        setError('Mật khẩu hiện tại không đúng.');
      } else {
        setError('Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 text-center p-4 bg-red-100 rounded-md">
          {error}
        </div>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Thông tin tóm tắt người dùng */}
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{user?.fullName}</h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
            </div>
            
            {/* Menu thẻ */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full py-2 px-3 text-left rounded-md flex items-center ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full py-2 px-3 text-left rounded-md flex items-center ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Bảo mật tài khoản
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full py-2 px-3 text-left rounded-md flex items-center ${activeTab === 'addresses' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Sổ địa chỉ
              </button>
              <Link
                to="/order-history"
                className="w-full py-2 px-3 text-left rounded-md flex items-center hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Lịch sử đơn hàng
              </Link>
              {user?.role === 'seller' && (
                <Link
                  to="/seller/dashboard"
                  className="w-full py-2 px-3 text-left rounded-md flex items-center hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Kênh người bán
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Thông báo lỗi/thành công */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
            )}
            
            {/* Tab Thông tin cá nhân */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formErrors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {formErrors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {formErrors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh/Thành phố
                      </label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Chọn Tỉnh/TP</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        {/* Thêm các tỉnh thành khác */}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện
                      </label>
                      <select
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      </select>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={updating}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {updating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Tab Bảo mật tài khoản */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formErrors.currentPassword ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {formErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formErrors.newPassword ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {formErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${formErrors.confirmNewPassword ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                      {formErrors.confirmNewPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmNewPassword}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={updating}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {updating ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Tab Sổ địa chỉ */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Sổ địa chỉ</h2>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>
                
                {/* Danh sách địa chỉ */}
                <div className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium mr-2">{user?.fullName}</h3>
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">
                          Mặc định
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{user?.phoneNumber}</p>
                      <p className="text-sm text-gray-700">
                        {[formData.address, formData.ward, formData.district, formData.city]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button className="text-blue-600 text-sm hover:underline">Sửa</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-red-600 text-sm hover:underline">Xóa</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
