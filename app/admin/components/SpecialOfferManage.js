<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Offer Management - Control Room</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen py-6 px-4 md:px-8">

  <!-- Header -->
  <div class="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 to-pink-600 rounded-t-2xl p-6 text-white shadow-lg flex items-center justify-between">
    <div>
      <h1 class="text-lg md:text-xl font-extrabold uppercase">AYAAT SPORT SHOP - কন্ট্রোল রুম</h1>
      <p class="text-pink-200 text-xs mt-1">স্পেশাল অফার প্রডাক্ট ও অর্ডার ম্যানেজমেন্ট</p>
    </div>
    <a href="control-room.html" class="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition">⚙️ কন্ট্রোল রুম</a>
  </div>

  <div class="max-w-4xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-8">
    
    <div id="alertBox" class="hidden p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
      🎉 সফল!
    </div>

    <!-- 1. Add Special Product Form -->
    <div class="bg-pink-50 p-5 rounded-xl border border-pink-200">
      <h3 class="text-base font-bold text-pink-900 mb-3">➕ নতুন স্পেশাল অফার প্রডাক্ট অ্যাড করুন</h3>
      <form id="addProductForm" class="space-y-4 bg-white p-4 rounded-xl border border-pink-100">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">প্রডাক্ট ছবি</label>
          <input type="file" id="productImage" accept="image/*" required class="w-full text-slate-500 text-xs border rounded-lg p-2 bg-slate-50 cursor-pointer">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">প্রডাক্ট শিরোনাম</label>
            <input type="text" id="prodTitle" required placeholder="যেমন: Special Edition Jersey" class="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">ডিসকাউন্ট মূল্য (টাকা)</label>
            <input type="number" id="prodDiscountPrice" required placeholder="যেমন: 599" class="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">নিয়মিত মূল্য (টাকা)</label>
            <input type="number" id="prodRegularPrice" required placeholder="যেমন: 1200" class="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">সংক্ষিপ্ত বিবরণ</label>
            <input type="text" id="prodDesc" placeholder="প্রডাক্ট সম্পর্কে সংক্ষিপ্ত কিছু লিখুন" class="w-full border p-2.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-pink-500">
          </div>
        </div>

        <button type="submit" id="saveProdBtn" class="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer">
          🚀 প্রডাক্ট পাবলিশ করুন
        </button>
      </form>
    </div>

    <!-- 3. Special Offer Products List (NEW) -->
    <div class="bg-pink-50/50 p-5 rounded-xl border border-pink-100">
      <h3 class="text-base font-bold text-pink-900 mb-3">🛍️ প্রকাশিত স্পেশাল অফার প্রডাক্টসমূহ</h3>
      <div id="productsContainer" class="space-y-3">
        <p class="text-xs text-slate-400">প্রডাক্ট লোড হচ্ছে...</p>
      </div>
    </div>

    <!-- 2. Special Offer Orders List -->
    <div class="bg-slate-50 p-5 rounded-xl border border-slate-200">
      <h3 class="text-base font-bold text-slate-800 mb-3">📦 স্পেশাল অফার পেজের অর্ডারসমূহ</h3>
      <div id="ordersContainer" class="space-y-3">
        <p class="text-xs text-slate-400">অর্ডার লোড হচ্ছে...</p>
      </div>
    </div>

  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyD3NXjyFRvir6EjTQz4nrDTQTQ8ESFpF8o",
      authDomain: "ayaat-shop.firebaseapp.com",
      projectId: "ayaat-shop",
      storageBucket: "ayaat-shop.firebasestorage.app",
      messagingSenderId: "762175348619",
      appId: "1:762175348619:web:9d547dfe03ebc76e92998e"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const cloudName = "b3gsgcpl";
    const uploadPreset = "tho4ycz8";

    const addProductForm = document.getElementById('addProductForm');
    const saveProdBtn = document.getElementById('saveProdBtn');
    const ordersContainer = document.getElementById('ordersContainer');
    const productsContainer = document.getElementById('productsContainer');
    const alertBox = document.getElementById('alertBox');

    function showAlert(msg) {
      alertBox.innerText = msg;
      alertBox.classList.remove('hidden');
      setTimeout(() => alertBox.classList.add('hidden'), 4000);
    }

    // Add product
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      saveProdBtn.innerText = "আপলোড হচ্ছে...";
      saveProdBtn.disabled = true;

      try {
        const file = document.getElementById('productImage').files[0];
        let imageUrl = "";

        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
          });
          const cloudData = await res.json();
          if (cloudData.secure_url) {
            imageUrl = cloudData.secure_url;
          }
        }

        await addDoc(collection(db, "specialOffers"), {
          title: document.getElementById('prodTitle').value.trim(),
          discountPrice: document.getElementById('prodDiscountPrice').value.trim(),
          regularPrice: document.getElementById('prodRegularPrice').value.trim(),
          description: document.getElementById('prodDesc').value.trim(),
          imageUrl: imageUrl,
          createdAt: serverTimestamp()
        });

        showAlert("🎉 স্পেশাল অফার প্রডাক্ট সফলভাবে অ্যাড হয়েছে!");
        addProductForm.reset();
        loadProducts();
      } catch (err) {
        console.error(err);
        alert("⚠️ প্রডাক্ট সেভ করতে সমস্যা হয়েছে!");
      } finally {
        saveProdBtn.innerText = "🚀 প্রডাক্ট পাবলিশ করুন";
        saveProdBtn.disabled = false;
      }
    });

    // Load Products
    async function loadProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "specialOffers"));
        if (querySnapshot.empty) {
          productsContainer.innerHTML = '<p class="text-xs text-slate-400">কোনো প্রডাক্ট পাওয়া যায়নি।</p>';
          return;
        }

        let html = "";
        querySnapshot.forEach((docSnap) => {
          const p = docSnap.data();
          const pId = docSnap.id;
          html += `
            <div class="bg-white p-3 rounded-xl border border-pink-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div class="flex items-center gap-3">
                <img src="${p.imageUrl || 'https://via.placeholder.com/60'}" class="w-12 h-12 object-cover rounded-lg border">
                <div class="space-y-0.5 text-xs">
                  <p class="font-bold text-slate-800">${p.title}</p>
                  <p class="text-pink-600 font-semibold">মূল্য: ৳${p.discountPrice} <span class="line-through text-slate-400 font-normal">৳${p.regularPrice}</span></p>
                </div>
              </div>
              <button onclick="deleteProduct('${pId}')" class="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shrink-0">
                প্রডাক্ট ডিলিট
              </button>
            </div>
          `;
        });
        productsContainer.innerHTML = html;
      } catch (err) {
        console.error(err);
        productsContainer.innerHTML = '<p class="text-xs text-red-500">প্রডাক্ট লোড করতে সমস্যা হয়েছে।</p>';
      }
    }

    window.deleteProduct = async function(id) {
      if (confirm("আপনি কি নিশ্চিতভাবে এই স্পেশাল প্রডাক্টটি ডিলিট করতে চান?")) {
        try {
          await deleteDoc(doc(db, "specialOffers", id));
          showAlert("🗑️ প্রডাক্ট সফলভাবে ডিলিট করা হয়েছে!");
          loadProducts();
        } catch (err) {
          console.error(err);
          alert("ডিলিট করতে সমস্যা হয়েছে!");
        }
      }
    };

    // Load Orders
    async function loadOrders() {
      try {
        const querySnapshot = await getDocs(collection(db, "specialOrders"));
        if (querySnapshot.empty) {
          ordersContainer.innerHTML = '<p class="text-xs text-slate-400">কোনো অর্ডার পাওয়া যায়নি।</p>';
          return;
        }

        let html = "";
        querySnapshot.forEach((docSnap) => {
          const o = docSnap.data();
          const oId = docSnap.id;
          html += `
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div class="space-y-1 text-xs">
                <p>🛒 <b>প্রডাক্ট:</b> ${o.productName} (<span class="text-pink-600 font-bold">৳${o.productPrice}</span>)</p>
                <p>👤 <b>গ্রাহক:</b> ${o.customerName} | 📞 <b>ফোন:</b> ${o.customerPhone}</p>
                <p>📍 <b>ঠিকানা:</b> ${o.customerAddress} | 📏 <b>সাইজ:</b> ${o.customerSize}</p>
              </div>
              <button onclick="deleteOrder('${oId}')" class="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shrink-0">
                ডিলিট অর্ডার
              </button>
            </div>
          `;
        });
        ordersContainer.innerHTML = html;
      } catch (err) {
        console.error(err);
        ordersContainer.innerHTML = '<p class="text-xs text-red-500">অর্ডার লোড করতে সমস্যা হয়েছে।</p>';
      }
    }

    window.deleteOrder = async function(id) {
      if (confirm("আপনি কি এই অর্ডারটি ডিলিট করতে চান?")) {
        try {
          await deleteDoc(doc(db, "specialOrders", id));
          showAlert("🗑️ অর্ডার সফলভাবে ডিলিট করা হয়েছে!");
          loadOrders();
        } catch (err) {
          console.error(err);
          alert("ডিলিট করতে সমস্যা হয়েছে!");
        }
      }
    };

    loadProducts();
    loadOrders();
  </script>
</body>
</html>

