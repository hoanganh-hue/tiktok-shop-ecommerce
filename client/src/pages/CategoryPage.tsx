import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/products/category/${categoryName}`);
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching category products:', err);
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryName) {
      fetchProducts();
    }
  }, [categoryName]);

  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'smartphones': 'Điện thoại thông minh',
      'wearables': 'Thiết bị đeo',
      'accessories': 'Phụ kiện',
      'laptops': 'Máy tính xách tay',
      'tablets': 'Máy tính bảng',
      'audio': 'Thiết bị âm thanh'
    };
    
    return categoryMap[category] || category;
  };

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Trở về trang chủ
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm nào trong danh mục này</h2>
          <p className="text-gray-600 mb-8">Chúng tôi sẽ bổ sung thêm sản phẩm cho danh mục này sớm.</p>
          <Link 
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300"
          >
            Khám phá danh mục khác
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Trở về trang chủ
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">{getCategoryDisplayName(categoryName || '')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
