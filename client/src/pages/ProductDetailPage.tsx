import React, { useState, useEffect } from 'react';
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

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Lấy thông tin sản phẩm
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);

        // Lấy các sản phẩm liên quan (cùng danh mục)
        const categoryResponse = await axios.get(`/api/products/category/${response.data.category}`);
        setRelatedProducts(categoryResponse.data
          .filter((item: Product) => item.id !== parseInt(id || '0'))
          .slice(0, 4)
        );

      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = async () => {
    try {
      // Gọi API thêm vào giỏ hàng (sẽ cần API endpoint tương ứng)
      await axios.post('/api/cart', {
        productId: product?.id,
        quantity: quantity
      });
      
      alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.id}`}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-cover" 
        />
        <div className="p-4">
          <h3 className="font-medium truncate">{product.name}</h3>
          <div className="mt-2">
            <span className="text-lg font-bold text-red-600">${product.price.toFixed(2)}</span>
          </div>
        </div>
      </Link>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error || !product) {
    return <div className="text-red-600 text-center p-4">{error || 'Sản phẩm không tồn tại'}</div>;
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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hình ảnh sản phẩm */}
          <div className="overflow-hidden rounded-lg">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-auto object-cover" 
            />
          </div>

          {/* Thông tin sản phẩm */}
          <div>
            <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
            <div className="mb-4">
              <span className="text-3xl font-bold text-red-600">${product.price.toFixed(2)}</span>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Danh mục: <span className="capitalize">{product.category}</span>
              </p>
              <p className="text-sm text-gray-600">
                Tình trạng: {product.stock > 0 ? (
                  <span className="text-green-600">Còn hàng ({product.stock})</span>
                ) : (
                  <span className="text-red-600">Hết hàng</span>
                )}
              </p>
            </div>

            {/* Chọn số lượng và thêm vào giỏ hàng */}
            {product.stock > 0 && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex border rounded-md mr-4">
                    <button 
                      onClick={decreaseQuantity}
                      className="px-3 py-1 border-r text-gray-600 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center focus:outline-none"
                    />
                    <button 
                      onClick={increaseQuantity}
                      className="px-3 py-1 border-l text-gray-600 hover:bg-gray-100"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={addToCart}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition duration-300"
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-6 rounded-md transition duration-300">
                    Mua ngay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Chi tiết và đánh giá sản phẩm */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Chi tiết sản phẩm</h2>
          <p className="text-gray-700">
            {product.description}
          </p>
          <p className="text-gray-700 mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur
            euismod, nisi nisl consectetur nisi, euismod nisi nisi vel euismod. Nullam euismod, nisi vel
            consectetur euismod, nisi nisl consectetur nisi, euismod nisi nisi vel euismod.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Đánh giá từ khách hàng</h2>
          <div className="space-y-4">
            {/* Mẫu đánh giá */}
            <div className="border-b pb-4">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-2 font-semibold">Nguyễn Văn A</p>
              </div>
              <p className="text-gray-700">Sản phẩm rất tốt, đóng gói cẩn thận và giao hàng nhanh chóng!</p>
            </div>

            <div className="border-b pb-4">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4].map(star => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="ml-2 font-semibold">Trần Thị B</p>
              </div>
              <p className="text-gray-700">Sản phẩm chất lượng tốt nhưng giao hàng hơi chậm.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
