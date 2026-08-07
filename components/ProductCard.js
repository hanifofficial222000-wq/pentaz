'use client';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        <img 
          src={product.image || "https://via.placeholder.com/150"} 
          alt={product.name} 
          className="h-28 md:h-36 w-full object-cover rounded" 
        />
        <p className="text-[11px] md:text-xs font-semibold mt-1.5 text-gray-800 truncate">{product.name}</p>
        <p className="text-[11px] md:text-xs text-teal-600 font-bold mt-0.5">৳ {product.price}</p>
        {product.category && (
          <span className="inline-block bg-gray-100 text-[9px] text-gray-500 px-1 py-0.5 rounded mt-1 truncate max-w-full">
            {product.category}
          </span>
        )}
      </div>
      
      {/* Quick Action Button (Absolute bad diye flex layout kora hoyeche) */}
      <button 
        onClick={() => alert(`Quick view / Pop-up for: ${product.name}`)}
        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] md:text-[10px] py-1 rounded shadow font-medium"
      >
        Quick View
      </button>
    </div>
  );
}
