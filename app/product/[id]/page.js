'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProductDetails() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
      setLoading(false);
    }
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-20 text-xs text-gray-500">Loading details...</div>;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-16">
      <div className="bg-teal-700 text-white p-4 text-center font-bold text-base shadow">
        Product Details
      </div>

      <div className="p-4 bg-white shadow-sm border-b">
        <img 
          src={product?.image || "https://via.placeholder.com/300"} 
          alt={product?.name || "Product"} 
          className="w-full h-64 object-cover rounded-lg" 
        />
        <h2 className="text-sm font-bold text-gray-800 mt-4">{product?.name || "Sample Jersey"}</h2>
        <p className="text-base text-teal-600 font-bold mt-1">৳ {product?.price || "550"}</p>
        <p className="text-xs text-gray-500 mt-2">Category: {product?.category || "Sports"}</p>

        <button 
          onClick={() => alert("Added to cart successfully!")}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-lg shadow"
        >
          Add to Cart / Buy Now
        </button>
      </div>
    </div>
  );
}
