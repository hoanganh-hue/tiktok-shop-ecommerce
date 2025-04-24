import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  sellerId: number;
}

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/products');
        const products = response.data;
        
        // Gẩn sản phẩm lên các mục
        setFeaturedProducts(products.slice(0, 4)); // 4 sản phẩm đầu tiên cho Featured
        setNewArrivals(products.slice(4, 8)); // 4 sản phẩm tiếp theo cho New Arrivals
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Component ProductCard đơn giản để hiển thị sản phẩm
  const ProductCard = ({ product }: { product: Product }) => (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      <Link to={`/product/${product.id}`}>
        <div className="h-48 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{product.name}</h3>
          <p className="text-gray-600 text-sm mt-1 h-12 overflow-hidden">{product.description}</p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xl font-bold text-red-600">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-500">{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
          </div>
        </div>
      </Link>
    </div>
  );

  const HeroBanner = () => (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-96 mb-10 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container mx-auto px-6 relative z-10 flex items-center h-full">
        <div className="w-full text-white">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">TikTok Shop E-commerce</h1>
          <p className="text-xl md:text-2xl mb-8">Mua sắm trực tuyến đơn giản và tiện lợi</p>
          <Link 
            to="/products" 
            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-100 transition duration-300"
          >
            Mua ngay
          </Link>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroBanner />
      
      {/* Featured Products */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
          <Link to="/products" className="text-blue-600 hover:underline">Xem tất cả</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Banner quảng cáo giữa trang */}
      <div className="bg-gray-100 p-8 rounded-lg mb-12 text-center">
        <h2 className="text-xl font-bold mb-3">Giảm giá lên đến 30%</h2>
        <p className="mb-4">Chương trình khuyến mãi đặc biệt trong tháng này</p>
        <Link 
          to="/sales" 
          className="inline-block bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300"
        >
          Khám phá ngay
        </Link>
      </div>

      {/* New Arrivals */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới nhất</h2>
          <Link to="/new-arrivals" className="text-blue-600 hover:underline">Xem tất cả</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Danh mục sản phẩm</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['smartphones', 'wearables', 'accessories', 'laptops'].map(category => (
            <Link 
              key={category} 
              to={`/category/${category}`}
              className="bg-gray-100 p-6 rounded-lg text-center hover:bg-gray-200 transition duration-300"
            >
              <h3 className="font-medium capitalize">{category}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
