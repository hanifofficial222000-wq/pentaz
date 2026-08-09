'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  doc, getDoc, collection, getDocs, addDoc, query, where, limit, serverTimestamp 
} from 'firebase/firestore';

// ⏱️ রিয়েল-টাইম ফ্ল্যাশ সেল কাউন্টডাউন টাইমার কম্পোনেন্ট
function FlashSaleTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    if (!endsAt) return;

    const targetTime = endsAt?.toDate ? endsAt.toDate() : new Date(endsAt);

    const updateTimer = () => {
      const now = new Date();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.isExpired) {
    return <span className="text-red-500 font-bold text-xs">ফ্ল্যাশ সেল অফারের সময় শেষ!</span>;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 px-3 py-2 rounded-xl shadow-md w-max animate-pulse">
      <span>⚡ ফ্ল্যাশ সেল শেষ হতে বাকি:</span>
      <span className="bg-black/30 px-2 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span>:</span>
      <span className="bg-black/30 px-2 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span>:</span>
      <span className="bg-black/30 px-2 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  );
}

function ProductDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [productId, setProductId] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notApproved, setNotApproved] = useState(false);

  // Gallery & Price State
  const [mainImage, setMainImage] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [regularPrice, setRegularPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Size State
  const [sizes, setSizes] = useState([]);
  const [currentSize, setCurrentSize] = useState('N/A');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Color Variants State
  const [colorVariants, setColorVariants] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', color: '' });

  // Order Form State
  const [cName, setCName] = useState('');
  const [cNumber, setCNumber] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [revCount, setRevCount] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);
  const [revName, setRevName] = useState('');
  const [revComment, setRevComment] = useState('');

  // More Products State
  const [moreProducts, setMoreProducts] = useState([]);

  // URL থেকে আইডি রিড করার হুক
  useEffect(() => {
    let id = searchParams.get('id');
    if (!id) {
      const pathSegments = window.location.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment !== 'product') {
        id = lastSegment;
      }
    }
    setProductId(id);
  }, [searchParams]);

  // প্রোডাক্ট ফেচ করার ইফেক্ট
  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      setLoading(true);
      setNotFound(false);
      setNotApproved(false);

      try {
        let docRef = doc(db, "products", productId);
        let docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          docRef = doc(db, "gifts", productId);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProductData(data);

          if (data.approved !== true && docSnap.ref.parent.id === "products") {
            setNotApproved(true);
            setLoading(false);
            return;
          }

          const regPrice = Number(data.price) || 0;
          const discPercent = Number(data.discount) || 0;
          setRegularPrice(regPrice);
          setDiscountPercent(discPercent);

          let calculated = regPrice;
          if (discPercent > 0) {
            calculated = Math.round(regPrice - (regPrice * discPercent) / 100);
          }
          setFinalPrice(calculated);

          // Images setup
          let imgs = [];
          if (data.imageUrls && data.imageUrls.length > 0) {
            imgs = data.imageUrls;
          } else if (data.imageUrl) {
            imgs = [data.imageUrl];
          } else if (data.image) {
            imgs = [data.image];
          }
          setImageUrls(imgs);
          if (imgs.length > 0) setMainImage(imgs[0]);

          // Color Variants setup
          if (data.colorVariants && data.colorVariants.length > 0) {
            setColorVariants(data.colorVariants);
            setSelectedColor(data.colorVariants[0].name);
          } else {
            setColorVariants([]);
            setSelectedColor('');
          }

          // Sizes setup
          if (data.sizes && data.sizes.length > 0 && !(data.sizes.length === 1 && (data.sizes[0] === 'Standard' || data.sizes[0] === ''))) {
            setSizes(data.sizes);
            setCurrentSize(data.sizes[0]);
          } else {
            setSizes([]);
            setCurrentSize('N/A');
          }

          setCouponCode('');
          setCouponMsg({ text: '', color: '' });
          setAppliedDiscount(0);

          loadReviews(productId);
          loadMoreProducts(data.categoryId, data.category, productId);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  async function loadReviews(prodId) {
    try {
      const q = query(collection(db, "reviews"), where("productId", "==", prodId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let total = 0;
        let count = 0;
        let revList = [];

        querySnapshot.forEach((d) => {
          const rData = d.data();
          const ratingNum = Number(rData.rating) || 5;
          total += ratingNum;
          count++;
          revList.push(rData);
        });

        setReviews(revList);
        setAvgRating((total / count).toFixed(1));
        setRevCount(count);
      } else {
        setReviews([]);
        setAvgRating(0);
        setRevCount(0);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  }

  async function loadMoreProducts(catId, categoryName, currentId) {
    try {
      let q;
      if (catId) {
        q = query(
          collection(db, "products"),
          where("categoryId", "==", catId),
          where("approved", "==", true),
          limit(7)
        );
      } else if (categoryName) {
        q = query(
          collection(db, "products"),
          where("category", "==", categoryName),
          where("approved", "==", true),
          limit(7)
        );
      } else {
        q = query(
          collection(db, "products"),
          where("approved", "==", true),
          limit(7)
        );
      }

      const snapshot = await getDocs(q);
      let list = [];

      snapshot.forEach((d) => {
        if (d.id === currentId) return;
        list.push({ id: d.id, ...d.data() });
      });

      setMoreProducts(list.slice(0, 6));
    } catch (err) {
      console.error("Error loading more products:", err);
    }
  }

  const handleApplyCoupon = () => {
    if (!productData) return;
    const code = couponCode.trim().toUpperCase();

    let basePrice = Number(productData.price) || 0;
    if (productData.discount > 0) {
      basePrice = Math.round(basePrice - (basePrice * productData.discount) / 100);
    }

    if (code === (productData.coupon || "").toUpperCase()) {
      const discountVal = Math.round(basePrice * 0.10);
      setAppliedDiscount(discountVal);
      setFinalPrice(basePrice - discountVal);
      setCouponMsg({ text: "🎉 কুপন সফলভাবে গৃহিত হয়েছে! ১০% এক্সট্রা ছাড় দেওয়া হয়েছে।", color: "text-green-600" });
    } else {
      setAppliedDiscount(0);
      setFinalPrice(basePrice);
      setCouponMsg({ text: "❌ ভুল কুপন কোড! দয়া করে সঠিক কোড দিন।", color: "text-red-600" });
    }
  };

  const handleAddToCart = () => {
    if (!productData) return;

    let cart = JSON.parse(localStorage.getItem('ayaat_cart')) || [];
    let productImg = mainImage || (imageUrls.length > 0 ? imageUrls[0] : '');

    let cartItem = {
      id: productId,
      title: productData.title || productData.name,
      price: finalPrice,
      image: productImg,
      size: currentSize || 'N/A',
      color: selectedColor || 'N/A',
      quantity: 1
    };

    let existingIndex = cart.findIndex(item => item.id === productId && item.size === cartItem.size && item.color === cartItem.color);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('ayaat_cart', JSON.stringify(cart));
    alert("সফলভাবে কার্টে যোগ করা হয়েছে! 🛒");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) {
      alert("দয়া করে আপনার নাম এবং প্রোডাক্ট মতামত লিখুন!");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        productId: productId,
        name: revName.trim(),
        rating: Number(selectedRating),
        comment: revComment.trim(),
        createdAt: serverTimestamp()
      });

      alert("ধন্যবাদ! আপনার রিভিউটি সফলভাবে সেভ করা হয়েছে।");
      setRevName('');
      setRevComment('');
      setSelectedRating(5);
      loadReviews(productId);
    } catch (err) {
      console.error(err);
      alert("রিভিউ জমা দিতে সমস্যা হয়েছে, আবার চেষ্টা করুন!");
    }
  };

  const handleSubmitOrder = async () => {
    if (!cName.trim() || !cNumber.trim() || !cAddress.trim()) {
      alert("দয়া করে আপনার নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা লিখুন!");
      return;
    }

    if (!productData) return;

    setSubmittingOrder(true);
    try {
      let productImg = mainImage || (imageUrls.length > 0 ? imageUrls[0] : '');
      let productPin = productData.productPin || productId.slice(0, 6).toUpperCase();
      let pName = productData.title || productData.name || 'Product';

      localStorage.setItem("userPhone", cNumber.trim());

      await addDoc(collection(db, "orders"), {
        productId: productId,
        productPin: productPin,
        productName: pName,
        productTitle: pName,
        price: finalPrice,
        productPrice: finalPrice,
        imageUrl: productImg,
        size: currentSize || 'N/A',
        color: selectedColor || 'N/A',
        customerName: cName.trim(),
        phone: cNumber.trim(),
        custPhone: cNumber.trim(),
        customerPhone: cNumber.trim(),
        customerAddress: cAddress.trim(),
        address: cAddress.trim(),
        status: "Pending",
        date: new Date().toLocaleDateString('bn-BD'),
        createdAt: serverTimestamp()
      });

      alert("অভিনন্দন! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।");
      router.push('/orders');
    } catch (err) {
      console.error(err);
      alert("অর্ডার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return <div className="text-center p-20 font-bold text-gray-500">প্রোডাক্ট লোড হচ্ছে...</div>;
  }

  if (notApproved) {
    return <div className="text-center p-20 font-bold text-[#e63946]">এই প্রোডাক্টটি এখনো অ্যাডমিন কর্তৃক অনুমোদিত (Approved) হয়নি!</div>;
  }

  if (notFound || !productData) {
    return <div className="text-center p-20 font-bold text-gray-600">প্রোডাক্টটি পাওয়া যায়নি!</div>;
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen p-2.5 pb-[100px] font-sans text-black">
      <div className="max-w-[600px] mx-auto bg-white rounded-[10px] p-[15px]">
        
        <Link href="/" className="text-[#333] no-underline text-[14px] inline-block mb-2.5 font-bold hover:text-[#e63946]">
          ← Back to Shop
        </Link>
        
        {/* Gallery with Horizontal Side Scroll */}
        <div className="mb-[15px] relative">
          {discountPercent > 0 && (
            <div className="absolute top-[15px] right-[15px] bg-[#e63946] text-white p-[8px_12px] text-[14px] font-bold rounded-[6px] z-20 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              {discountPercent}% OFF
            </div>
          )}
          {productData.isFlashSale && (
            <div className="absolute top-[15px] left-[15px] bg-amber-500 text-white p-[6px_10px] text-[12px] font-extrabold rounded-[6px] z-20 shadow">
              ⚡ FLASH SALE
            </div>
          )}
          <img src={mainImage} className="w-full rounded-[10px] mb-2 h-[400px] object-cover border border-[#eee]" alt="Product" />
          
          {imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {imageUrls.map((imgUrl, idx) => (
                <img 
                  key={idx} 
                  src={imgUrl} 
                  onClick={() => setMainImage(imgUrl)}
                  className={`w-[70px] h-[70px] object-cover rounded-[8px] border-2 cursor-pointer flex-shrink-0 transition-all ${mainImage === imgUrl ? 'border-[#e63946] scale-105' : 'border-[#ddd]'}`} 
                  alt="Thumbnail" 
                />
              ))}
            </div>
          )}
        </div>

        {/* ⚡ ফ্ল্যাশ সেল কাউন্টডাউন টাইমার */}
        {productData.isFlashSale && productData.flashSaleEndsAt && (
          <div className="my-3">
            <FlashSaleTimer endsAt={productData.flashSaleEndsAt} />
          </div>
        )}

        <h1 className="text-[20px] my-2.5 text-[#222] font-bold">{productData.title || productData.name}</h1>
        
        <div className="bg-[#eef2f7] border-l-4 border-[#007bff] p-[8px_12px] my-2.5 rounded-r-[8px] text-[13px] text-[#333] font-bold">
          📦 প্রোডাক্ট আইডি / পিন: <span>{productData.productPin || (productId ? productId.slice(0, 6).toUpperCase() : '')}</span>
        </div>

        <p className="text-[14px] text-[#555] mb-2.5">{productData.description || ''}</p>
        
        <ul className="list-none my-[15px] space-y-1">
          <li className="text-[14px] text-[#444]">✓ Free Delivery in Moheskhali</li>
          <li className="text-[14px] text-[#444]">✓ Cash On Delivery All Over Bangladesh</li>
          <li className="text-[14px] text-[#444]">✓ Estimated Delivery: 5-7 Days</li>
          <li className="text-[14px] text-[#444]">✓ Cox’s Bazar outside Delivery 120 ৳</li>
          <li className="text-[14px] text-[#444]">✓ Cox&apos;s Bazar all over delivery 100 ৳ single product double product 50 ৳</li>
        </ul>

        {/* Price Box */}
        <div className="flex items-center gap-3 my-2.5 flex-wrap">
          <div className="text-[#e63946] text-[24px] font-bold">৳ {finalPrice}</div>
          {discountPercent > 0 && (
            <div className="text-[#888] text-[16px] line-through">৳ {regularPrice}</div>
          )}
          {discountPercent > 0 && (
            <div className="bg-[#ffe5e6] text-[#e63946] p-[4px_8px] rounded-[4px] text-[12px] font-bold">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="my-4">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-[#333]">Select Size:</label>
              <span className="text-[12px] text-[#007bff] underline cursor-pointer" onClick={() => setIsSizeChartOpen(true)}>📏 Size Chart</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s, idx) => (
                <button 
                  key={idx}
                  type="button" 
                  onClick={() => setCurrentSize(s)}
                  className={`p-[10px_16px] border-2 rounded-[8px] font-bold text-[15px] cursor-pointer transition ${currentSize === s ? 'border-[#e63946] bg-[#e63946] text-white' : 'border-[#ddd] bg-white text-black'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Variants Card System */}
        {colorVariants.length > 0 && (
          <div className="my-4">
            <label className="font-bold block mb-2 text-[#333]">Select Color: <span className="text-[#e63946]">{selectedColor}</span></label>
            <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {colorVariants.map((col, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSelectedColor(col.name);
                    if (col.imageUrl) setMainImage(col.imageUrl);
                  }}
                  className={`flex flex-col items-center p-1.5 border-2 rounded-xl cursor-pointer transition-all flex-shrink-0 w-20 bg-white ${selectedColor === col.name ? 'border-[#e63946] shadow-md scale-105' : 'border-gray-200 opacity-80'}`}
                >
                  <img src={col.imageUrl} alt={col.name} className="w-16 h-16 object-cover rounded-lg mb-1" />
                  <span className="text-[11px] font-bold text-center truncate w-full">{col.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupon Section */}
        {productData.coupon && (
          <div className="bg-[#fff8f8] border border-dashed border-[#e63946] p-3 rounded-[8px] my-4">
            <p className="text-[13px] font-bold text-[#e63946]">🎟️ আপনার কি কোনো কুপন কোড আছে?</p>
            <div className="flex gap-2 mt-1.5">
              <input 
                type="text" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="কুপন কোড লিখুন (যেমন: EID50)" 
                className="flex-1 p-2 border border-[#ddd] rounded-[6px] text-[13px] outline-none bg-white text-black"
              />
              <button type="button" onClick={handleApplyCoupon} className="bg-[#e63946] text-white border-none px-3.5 py-2 rounded-[6px] font-bold cursor-pointer text-[13px]">
                প্রয়োগ করুন
              </button>
            </div>
            {couponMsg.text && <p className={`text-[12px] mt-1 font-bold ${couponMsg.color}`}>{couponMsg.text}</p>}
          </div>
        )}

        {/* Seller Info */}
        {productData.sellerName && (
          <div className="bg-[#f8f9fa] border-l-4 border-[#e63946] p-[10px_12px] my-3 rounded-r-[8px] text-[13px] text-[#333]">
            <p className="my-0.5">👤 <b>বিক্রেতা:</b> <span>{productData.sellerName}</span></p>
            <p className="my-0.5">📞 <b>মোবাইল:</b> <a href={`https://wa.me/${productData.sellerPhone}`} target="_blank" rel="noreferrer" className="text-[#007bff] font-bold no-underline">{productData.sellerPhone || 'N/A'}</a></p>
          </div>
        )}

        {/* Order Inputs */}
        <div className="space-y-3.5 my-4">
          <div>
            <label className="font-bold block mb-1 text-[14px] text-[#333]">Your Name:</label>
            <input type="text" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Enter full name" className="w-full p-3 border border-[#ddd] rounded-[8px] text-[15px] outline-none bg-white text-black focus:border-[#e63946]" />
          </div>
          <div>
            <label className="font-bold block mb-1 text-[14px] text-[#333]">Your Phone Number:</label>
            <input type="tel" value={cNumber} onChange={(e) => setCNumber(e.target.value)} placeholder="Enter active phone number" className="w-full p-3 border border-[#ddd] rounded-[8px] text-[15px] outline-none bg-white text-black focus:border-[#e63946]" />
          </div>
          <div>
            <label className="font-bold block mb-1 text-[14px] text-[#333]">Delivery Address:</label>
            <textarea value={cAddress} onChange={(e) => setCAddress(e.target.value)} rows="3" placeholder="Enter full address with landmark" className="w-full p-3 border border-[#ddd] rounded-[8px] text-[15px] outline-none bg-white text-black focus:border-[#e63946]"></textarea>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-[#fafafa] p-4 mt-5 rounded-[10px] border border-[#eee]">
          <div className="text-[16px] mb-2.5 font-bold text-[#333]">⭐ Customer Reviews ({avgRating}/5 - {revCount}টি রিভিউ)</div>
          
          <div className="space-y-2 mb-4">
            {reviews.length === 0 ? (
              <div className="text-[#777] text-[13px] py-1">এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনিই দিন!</div>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="border-b border-[#eee] pb-2 mb-2">
                  <div className="text-[#ffb400] text-[14px]">{"★".repeat(rev.rating || 5)}{"☆".repeat(5 - (rev.rating || 5))}</div>
                  <p className="text-[13px] my-1 text-[#444]">{rev.comment}</p>
                  <div className="text-[12px] text-[#777]">- {rev.name}</div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmitReview} className="pt-3.5 border-t border-dashed border-[#ddd]">
            <h4 className="text-[14px] mb-2.5 text-[#333] font-bold">✍️ প্রোডাক্টের একটি রিভিউ দিন</h4>
            
            <div className="flex items-center gap-1.5 mb-3 bg-white p-2.5 rounded-[8px] border border-[#ddd] justify-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <span 
                  key={num} 
                  onClick={() => setSelectedRating(num)}
                  className={`text-[28px] cursor-pointer transition select-none ${num <= selectedRating ? 'text-[#ffb400]' : 'text-[#ccc]'}`}
                >
                  ★
                </span>
              ))}
              <span className="text-[13px] font-bold text-[#555] ml-2">({['০', '১', '২', '৩', '৪', '৫'][selectedRating]} স্টার)</span>
            </div>

            <div className="space-y-3 mb-3">
              <input type="text" value={revName} onChange={(e) => setRevName(e.target.value)} placeholder="আপনার নাম" className="w-full p-3 border border-[#ddd] rounded-[8px] text-[15px] outline-none bg-white text-black" />
              <textarea value={revComment} onChange={(e) => setRevComment(e.target.value)} rows="2" placeholder="প্রোডাক্ট সম্পর্কে লিখুন..." className="w-full p-3 border border-[#ddd] rounded-[8px] text-[15px] outline-none bg-white text-black"></textarea>
            </div>

            <button type="submit" className="w-full p-3 bg-[#e63946] hover:bg-[#d62839] text-white border-none rounded-[8px] font-bold text-[15px] cursor-pointer transition">
              রিভিউ সেভ করুন
            </button>
          </form>
        </div>

        {/* You May Also Like Section (Updated with direct navigation fix) */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-[#eee]">
          <div className="text-[16px] font-bold mb-3 text-[#222]">🛍️ You May Also Like</div>
          <div className="grid grid-cols-3 gap-2">
            {moreProducts.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 text-[13px] py-4">এই ক্যাটাগরিতে আর কোনো প্রোডাক্ট নেই!</div>
            ) : (
              moreProducts.map((item) => {
                let itemImg = (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : (item.imageUrl || item.image);
                let itemRegPrice = Number(item.price) || 0;
                let itemDiscount = Number(item.discount) || 0;
                let finalDispPrice = itemRegPrice;
                if (itemDiscount > 0) {
                  finalDispPrice = Math.round(itemRegPrice - (itemRegPrice * itemDiscount) / 100);
                }
                let itemPin = item.productPin || item.id.slice(0, 6).toUpperCase();

                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      window.location.href = `/product?id=${item.id}`;

                    }}
                    className="border border-[#eee] rounded-[10px] overflow-hidden bg-white no-underline text-[#333] flex flex-col shadow-sm relative cursor-pointer hover:border-[#e63946] transition-all"
                  >
                    <div className="relative w-full">
                      {itemDiscount > 0 && (
                        <div className="absolute top-1 right-1 bg-[#e63946] text-white text-[10px] font-bold p-[2px_6px] rounded-[4px] z-10">
                          {itemDiscount}% OFF
                        </div>
                      )}
                      <img src={itemImg} alt="Product" className="w-full h-[110px] object-cover block" />
                    </div>

                    <div className="p-2 flex flex-col flex-grow">
                      <h3 className="text-[11px] font-bold mb-1 line-clamp-2 text-[#222]">
                        {item.title || item.name}
                      </h3>
                      <div className="text-[10px] text-[#007bff] font-bold mb-1.5 bg-[#eef2f7] p-[2px_4px] rounded inline-block w-fit">
                        ID: {itemPin}
                      </div>
                      <div className="flex items-center gap-1 mt-auto">
                        <span className="text-[#e63946] text-[12px] font-bold">৳ {finalDispPrice}</span>
                        {itemDiscount > 0 && (
                          <span className="text-[#888] text-[10px] line-through">৳ {itemRegPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="fixed bottom-3.5 left-3.5 right-3.5 z-50 max-w-[600px] mx-auto flex gap-2">
        <button type="button" onClick={handleAddToCart} className="flex-1 bg-[#ff9f43] hover:bg-[#f39c12] text-white text-center p-3.5 rounded-[10px] border-none font-bold text-[15px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition">
          🛒 কার্টে যোগ করুন
        </button>
        <button type="button" onClick={handleSubmitOrder} disabled={submittingOrder} className="flex-1 bg-[#e63946] hover:bg-[#d62839] text-white text-center p-3.5 rounded-[10px] border-none font-bold text-[15px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition disabled:opacity-50">
          {submittingOrder ? "অর্ডার সাবমিট হচ্ছে..." : "⚡ সরাসরি অর্ডার"}
        </button>
      </div>

    </div>
  );
}

function ProductDetailsWrapper() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  return (
    <Suspense key={productId || 'default'} fallback={<div className="text-center p-20 font-bold text-gray-500">লোড হচ্ছে...</div>}>
      <ProductDetailsContent />
    </Suspense>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<div className="text-center p-20 font-bold text-gray-500">লোড হচ্ছে...</div>}>
      <ProductDetailsWrapper />
    </Suspense>
  );
}
