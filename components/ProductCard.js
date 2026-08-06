'use client';
export default function ProductCard({ product }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative">
      <img 
        src={product.image || "https://via.placeholder.com/150"} 
        alt={product.name} 
        className="h-36 w-full object-cover rounded" 
      />
      <p className="text-xs font-semibold mt-2 text-gray-800 truncate">{product.name}</p>
      <p className="text-xs text-teal-600 font-bold mt-1">৳ {product.price}</p>
      
      {/* Pop-up / Quick Action Button */}
      <button 
        onClick={() => alert(`Quick view / Pop-up for: ${product.name}`)}
        className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded-full shadow"
      >
        + Pop-up
      </button>
    </div>
  );
}
