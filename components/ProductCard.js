'use client';

import Link from 'next/link';

export default function ProductCard({ product }) {
  const productId = product.id || product._id;
  const productName = product.title || product.name;
  const productImage = (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : (product.imageUrl || product.image || "https://via.placeholder.com/150");

  return (
    <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
      
      {/* প্রোডাক্টের ছবি ও নামের ওপর ক্লিক করলে ডিটেইলস পেজে যাবে */}
      <Link href={`/product?id=${productId}`} className="no-underline flex flex-col flex-grow">
        <div>
          <img 
            src={productImage} 
            alt={productName} 
            className="h-28 md:h-36 w-full object-cover rounded" 
          />
          <p className="text-[11px] md:text-xs font-semibold mt-1.5 text-gray-800 truncate">{productName}</p>
          <p className="text-[11px] md:text-xs text-teal-600 font-bold mt-0.5">৳ {product.price}</p>
          {product.category && (
            <span className="inline-block bg-gray-100 text-[9px] text-gray-500 px-1 py-0.5 rounded mt-1 truncate max-w-full">
              {product.category}
            </span>
          )}
        </div>
      </Link>
      
      {/* Quick View বাটন যা সরাসরি ডিটেইলস পেজে রিডাইরেক্ট করবে */}
      <Link 
        href={`/product?id=${productId}`}
        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] md:text-[10px] py-1 rounded shadow font-medium text-center block no-underline transition-all"
      >
        Quick View
      </Link>
      
    </div>
  );
}
