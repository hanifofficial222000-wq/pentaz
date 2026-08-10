'use client';

import Link from 'next/link';

export default function ProductCard({ product }) {
  if (!product) return null;

  // আইডি ধরার লজিকটি আরও সুরক্ষিত করা হলো
  const productId = product.id || product._id || product.productId;
  const productName = product.title || product.name || 'Product';
  const productPrice = Number(product.price) || 0;
  
  // ডিসকাউন্ট প্রাইস হিসাব (যদি ডিসকাউন্ট থাকে)
  const discount = Number(product.discount) || 0;
  let finalPrice = productPrice;
  if (discount > 0) {
    finalPrice = Math.round(productPrice - (productPrice * discount) / 100);
  }

  const productImage = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls[0] 
    : (product.imageUrl || product.image || "https://via.placeholder.com/150");

  // যদি আইডি না থাকে, তবে কনসোলে ওয়ার্নিং দেখাবে যেন বুঝতে সহজ হয়
  if (!productId) {
    console.warn("Product ID is missing for product:", product);
  }

  return (
    <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
      
      {/* প্রোডাক্টের ছবি ও নামের ওপর ক্লিক করলে ডিটেইলস পেজে যাবে */}
      <Link href={productId ? `/product?id=${productId}` : '#'} className="no-underline flex flex-col flex-grow">
        <div>
          <div className="relative">
            {discount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
                {discount}% OFF
              </span>
            )}
            <img 
              src={productImage} 
              alt={productName} 
              className="h-28 md:h-36 w-full object-cover rounded" 
            />
          </div>
          <p className="text-[11px] md:text-xs font-semibold mt-1.5 text-gray-800 truncate">{productName}</p>
          
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[11px] md:text-xs text-red-600 font-bold">৳ {finalPrice}</span>
            {discount > 0 && (
              <span className="text-[9px] text-gray-400 line-through">৳ {productPrice}</span>
            )}
          </div>

          {product.category && (
            <span className="inline-block bg-gray-100 text-[9px] text-gray-500 px-1 py-0.5 rounded mt-1 truncate max-w-full">
              {product.category}
            </span>
          )}
        </div>
      </Link>
      
      {/* Quick View বাটন */}
      <Link 
        href={productId ? `/product?id=${productId}` : '#'}
        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] md:text-[10px] py-1 rounded shadow font-medium text-center block no-underline transition-all"
      >
        Quick View
      </Link>
      
    </div>
  );
}
