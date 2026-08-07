'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Banners State (Top, Middle, Circle Pop-up)
  const [bannerData, setBannerData] = useState({
    topBannerText: 'Ayaat Sport Shop Banner',
    middleBannerImage: '',
    popupBannerImage: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Products Fetch Kora
        const prodSnapshot = await getDocs(collection(db, "products"));
        const productList = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);

        // 2. Categories Fetch Kora
        const catSnapshot = await getDocs(collection(db, "categories"));
        const catList = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catList);

        // 3. 3-Banners Data Fetch Kora from Firestore
        const bannerDoc = await getDoc(doc(db, "settings", "banners"));
        if (bannerDoc.exists()) {
          setBannerData(bannerDoc.data());
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
    fetchData();
  }, []);

  // Filter products based on search term AND selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="max-w-md mx-auto bg-gray-50 min-h-screen pb-16 shadow-xl relative">
      
      {/* 1. TOP BANNER */}
      <div className="bg-teal-700 text-white text-center py-3 px-4 font-bold text-sm md:text-base shadow truncate">
        {bannerData.topBannerText || "Ayaat Sport Shop Banner"}
      </div>

      {/* 2. Dynamic Category Slider */}
      <div className="flex overflow-x-auto space-x-4 p-4 bg-white shadow-sm no-scrollbar">
        {/* 'All' Category Button */}
        <div 
          onClick={() => setSelectedCategory('All')} 
          className="flex-shrink-0 w-20 text-center cursor-pointer"
        >
          <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center text-xs font-semibold border shadow-inner ${selectedCategory === 'All' ? 'bg-teal-700 text-white border-teal-800' : 'bg-gray-100 text-gray-600'}`}>
            🔥
          </div>
          <p className="text-xs mt-1 font-medium text-gray-700">All</p>
        </div>

        {/* Database Categories */}
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            onClick={() => setSelectedCategory(cat.name || cat.categoryName)} 
            className="flex-shrink-0 w-20 text-center cursor-pointer"
          >
            <div className={`h-16 w-16 rounded-full mx-auto flex items-center justify-center text-xs font-semibold border shadow-inner overflow-hidden ${selectedCategory === (cat.name || cat.categoryName) ? 'bg-teal-700 text-white border-teal-800' : 'bg-gray-100 text-gray-600'}`}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
              ) : (
                '🏷️'
              )}
            </div>
            <p className="text-xs mt-1 font-medium text-gray-700 truncate">{cat.name || cat.categoryName}</p>
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

      {/* 5. MIDDLE BANNER */}
      <div className="my-5 px-4">
        {bannerData.middleBannerImage ? (
          <div className="rounded-lg overflow-hidden shadow-md border bg-white">
            <img src={bannerData.middleBannerImage} alt="Special Offer" className="w-full h-36 object-cover" />
          </div>
        ) : (
          <div className="bg-slate-900 text-white text-center py-6 font-bold text-lg shadow rounded-lg">
            Special Offer Banner
          </div>
        )}
      </div>

      {/* 6. All Product Grid (3 cols on mobile, 4 on desktop) */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-800">
            {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
          </h3>
          {selectedCategory !== 'All' && (
            <button onClick={() => setSelectedCategory('All')} className="text-xs text-teal-700 font-bold underline">
              View All
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-2 md:p-3 rounded-lg shadow-sm border border-gray-100 relative flex flex-col justify-between">
                <div>
                  <img 
                    src={product.image || "https://via.placeholder.com/150"} 
                    alt={product.name} 
                    className="h-28 md:h-36 w-full object-cover rounded" 
                  />
                  <p className="text-[11px] md:text-xs font-semibold mt-1.5 text-gray-800 truncate">{product.name}</p>
                  <p className="text-[11px] md:text-xs text-teal-600 font-bold mt-0.5">৳ {product.price}</p>
                  <span className="inline-block bg-gray-100 text-[9px] text-gray-500 px-1 py-0.5 rounded mt-1 truncate max-w-full">
                    {product.category}
                  </span>
                </div>
                
                <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] md:text-[10px] py-1 rounded shadow font-medium">
                  Quick View
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-3 lg:col-span-4 text-center py-8 text-gray-400 text-xs font-medium">
              No products found in this category!
            </div>
          )}
        </div>
      </div>

      {/* 7. BOTTOM CIRCLE POP-UP AD (Floating Circular Ad on bottom right/left) */}
      {bannerData.popupBannerImage && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-teal-600 shadow-xl bg-white flex items-center justify-center cursor-pointer">
            <img 
              src={bannerData.popupBannerImage} 
              alt="Popup Ad" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      )}

    </main>
  );
}
