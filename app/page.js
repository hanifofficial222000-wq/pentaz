'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    }
    fetchProducts();
  }, []);

  // Search filter apply korar jonno
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="max-w-md mx-auto bg-gray-50 min-h-screen pb-12 shadow-xl">
      
      {/* 1. Top Banner */}
      <div className="bg-teal-700 text-white text-center py-4 font-bold text-lg shadow">
        Ayaat Sport Shop Banner
      </div>

      {/* 2. Category Slider (Horizontal Scroll) */}
      <div className="flex overflow-x-auto space-x-4 p-4 bg-white shadow-sm no-scrollbar">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex-shrink-0 w-20 text-center cursor-pointer">
            <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-xs font-semibold text-gray-600 border shadow-inner">
              🏷️
            </div>
            <p className="text-xs mt-1 font-medium text-gray-700">Category {item}</p>
          </div>
        ))}
      </div>

      {/* 3. Search Bar */}
      <div className="px-4 my-3">
        <div className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
          <span className="mr-2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search products here..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm bg-transparent" 
          />
          {searchTerm && (
            <span className="text-gray-400 cursor-pointer" onClick={() => setSearchTerm('')}>✖</span>
          )}
        </div>
      </div>

      {/* 4. Trending Video Section */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold mb-2 flex items-center text-gray-800">
          Trending Videos <span className="ml-1">🔥</span>
        </h3>
        <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar">
          {[1, 2, 3, 4].map((vid) => (
            <div key={vid} className="w-28 h-40 bg-slate-800 rounded-lg flex-shrink-0 relative shadow-md flex items-center justify-center text-xs text-white font-semibold">
              Video {vid}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Middle Banner */}
      <div className="bg-slate-900 text-white text-center py-6 my-5 font-bold text-xl shadow">
        Special Offer Banner
      </div>

      {/* 6. All Product Grid */}
      <div className="px-4">
        <h3 className="text-sm font-bold mb-3 text-gray-800">All Products</h3>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative flex flex-col justify-between">
                <div>
                  <img 
                    src={product.image || "https://via.placeholder.com/150"} 
                    alt={product.name} 
                    className="h-36 w-full object-cover rounded" 
                  />
                  <p className="text-xs font-semibold mt-2 text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-teal-600 font-bold mt-1">৳ {product.price}</p>
                </div>
                
                {/* Pop-up / Quick Action Button */}
                <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1.5 rounded shadow font-medium">
                  Quick View
                </button>
              </div>
            ))
          ) : (
            // Database-e product na thakle ba search-e na mille dummy items dekhabe
            [1, 2, 3, 4].map((p) => (
              <div key={p} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative flex flex-col justify-between">
                <div>
                  <div className="h-36 bg-teal-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    Jersey {p}
                  </div>
                  <p className="text-xs font-semibold mt-2 text-gray-800">Barca Home Kit {p}</p>
                  <p className="text-xs text-teal-600 font-bold mt-1">৳ 550</p>
                </div>
                <button className="mt-3 w-full bg-blue-600 text-white text-[10px] py-1.5 rounded shadow font-medium">
                  Quick View
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </main>
  );
}
