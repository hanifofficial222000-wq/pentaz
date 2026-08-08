<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift & Award Management - AYAAT SPORT SHOP</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white min-h-screen py-8 px-4 md:px-8 font-sans">

  <div class="max-w-4xl mx-auto">
    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-8 bg-gradient-to-r from-orange-600 via-slate-800 to-slate-900 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-2xl gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold">Gift & Award Management</h1>
      </div>
      <a href="index.html" class="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl border border-white/20 backdrop-blur-md transition flex items-center gap-2 shrink-0 shadow-lg">
        <span>← কন্ট্রোল রুম</span>
      </a>
    </div>

    <!-- Product Add / Edit Form -->
    <div class="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl mb-8">
      <h2 id="form-title" class="text-lg font-bold text-orange-400 mb-5 flex items-center gap-2">
        <span>🎁</span> নতুন গিফট প্রোডাক্ট যোগ করুন
      </h2>
      <form id="gift-form" class="space-y-4">
        <input type="hidden" id="product-id">
        
        <!-- Category Dropdown -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">ক্যাটেগরি সিলেক্ট করুন</label>
          <select id="p-category" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition">
            <option value="">ক্যাটেগরি লোড হচ্ছে...</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">প্রোডাক্টের নাম</label>
          <input type="text" id="p-name" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" placeholder="যেমন: স্পেশাল জার্সি বা উইনিং প্রাইজ">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">মূল্য (৳) <span class="text-slate-500 font-normal">(ঐচ্ছিক)</span></label>
            <input type="number" id="p-price" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" placeholder="00">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">অফার টাইপ (Offer Type)</label>
            <input type="text" id="p-offer-type" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" placeholder="হাত দিয়ে লিখুন (যেমন: Free / 30 Shares)">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">প্রোডাক্ট ইমেজ (Choose File)</label>
          <input type="file" id="p-image-file" accept="image/*" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 transition">
          <input type="hidden" id="p-image">
          <div id="upload-status" class="text-xs text-orange-400 mt-1"></div>
        </div>

        <div class="pt-2">
          <button type="submit" id="save-btn" class="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-orange-600/20">
            প্রোডাক্ট সেভ করুন
          </button>
        </div>
      </form>
    </div>

    <!-- Product List -->
    <div class="bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl">
      <h2 class="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <span>📋</span> সকল গিফট প্রোডাক্ট লিস্ট
      </h2>
      <div id="gift-product-list" class="space-y-3">
        <!-- Dynamic Products Will Show Here -->
      </div>
    </div>
  </div>

  <!-- Firebase & Cloudinary Logic Scripts -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

    const form = document.getElementById('gift-form');
    const productList = document.getElementById('gift-product-list');
    const categorySelect = document.getElementById('p-category');
    const imageFileInput = document.getElementById('p-image-file');
    const uploadStatus = document.getElementById('upload-status');
    const saveBtn = document.getElementById('save-btn');

    const CLOUD_NAME = "b3gsgcpl";
    const UPLOAD_PRESET = "tho4ycz8";

    async function loadCategories() {
      try {
        categorySelect.innerHTML = '<option value="">ক্যাটেগরি লোড হচ্ছে...</option>';
        let categoriesSet = new Set();

        try {
          const catSnapshot = await getDocs(collection(db, "categories"));
          catSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if(data.name) categoriesSet.add(data.name);
            if(data.title) categoriesSet.add(data.title);
            if(data.category) categoriesSet.add(data.category);
          });
        } catch (err) {
          console.log("Categories collection empty.");
        }

        try {
          const prodSnapshot = await getDocs(collection(db, "products"));
          prodSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if(data.category) categoriesSet.add(data.category);
          });
        } catch (err) {
          console.log("Products collection check skipped.");
        }

        categorySelect.innerHTML = '<option value="">ক্যাটেগরি সিলেক্ট করুন</option>';

        if(categoriesSet.size === 0) {
          categorySelect.innerHTML = '<option value="">কোনো ক্যাটেগরি পাওয়া যায়নি</option>';
          return;
        }

        categoriesSet.forEach(cat => {
          categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });

      } catch (error) {
        console.error("Error loading categories: ", error);
        categorySelect.innerHTML = '<option value="">ক্যাটেগরি লোড করতে সমস্যা হয়েছে</option>';
      }
    }

    async function uploadImageToCloudinary(file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      uploadStatus.innerText = 'ইমেজ আপলোড হচ্ছে...';
      saveBtn.disabled = true;

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.secure_url) {
          uploadStatus.innerText = 'ইমেজ আপলোড সফল হয়েছে!';
          saveBtn.disabled = false;
          return data.secure_url;
        } else {
          throw new Error('Image upload failed');
        }
      } catch (error) {
        console.error(error);
        uploadStatus.innerText = 'ইমেজ আপলোড ব্যর্থ হয়েছে!';
        saveBtn.disabled = false;
        return null;
      }
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('product-id').value;
      const category = categorySelect.value;
      const name = document.getElementById('p-name').value;
      const price = document.getElementById('p-price').value || "";
      const offerType = document.getElementById('p-offer-type').value;
      let imageUrl = document.getElementById('p-image').value;

      if(!category) {
        alert('দয়া করে একটি ক্যাটেগরি সিলেক্ট করুন!');
        return;
      }

      const imageFile = imageFileInput.files[0];
      if (imageFile) {
        const uploadedUrl = await uploadImageToCloudinary(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          return;
        }
      }

      if (!imageUrl && !id) {
        alert('দয়া করে একটি প্রোডাক্ট ইমেজ সিলেক্ট করুন!');
        return;
      }

      try {
        if(id) {
          // আপডেট করার সময় 'gifts' কালেকশন ব্যবহার করা হয়েছে
          const productRef = doc(db, "gifts", id);
          const updateData = { category, title: name, price, offerType };
          if(imageUrl) updateData.imageUrl = imageUrl;
          
          await updateDoc(productRef, updateData);
          document.getElementById('product-id').value = '';
          document.getElementById('form-title').innerHTML = '<span>🎁</span> নতুন গিফট প্রোডাক্ট যোগ করুন';
        } else {
          // নতুন সেভ করার সময় 'gifts' কালেকশন ব্যবহার করা হয়েছে যাতে my-gifts.html এ শো করে
          await addDoc(collection(db, "gifts"), {
            category,
            title: name,
            price,
            offerType,
            imageUrl: imageUrl,
            createdAt: Date.now()
          });
        }

        form.reset();
        document.getElementById('p-image').value = '';
        uploadStatus.innerText = '';
        loadProducts();
      } catch (error) {
        console.error("Error saving product: ", error);
        alert('ডাটা সংরক্ষণ করতে সমস্যা হয়েছে!');
      }
    });

    async function loadProducts() {
      productList.innerHTML = '<p class="text-xs text-slate-500 text-center py-6">লোড হচ্ছে...</p>';
      try {
        // ডাটা লোড করার সময় 'gifts' কালেকশন ব্যবহার করা হয়েছে
        const querySnapshot = await getDocs(collection(db, "gifts"));
        productList.innerHTML = '';
        
        if(querySnapshot.empty) {
          productList.innerHTML = '<p class="text-xs text-slate-500 text-center py-6">কোনো গিফট প্রোডাক্ট যুক্ত করা হয়নি।</p>';
          return;
        }

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const title = data.title || data.name || '';
          const img = data.imageUrl || data.image || '';
          
          productList.innerHTML += `
            <div class="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700/80 gap-4 hover:border-slate-600 transition">
              <div class="flex items-center gap-3.5">
                <img src="${img}" class="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0" alt="">
                <div>
                  <h4 class="text-sm font-bold text-white">${title}</h4>
                  <p class="text-xs text-slate-400 mt-0.5">ক্যাটেগরি: <span class="text-amber-400 font-semibold">${data.category || 'N/A'}</span> | মূল্য: <span class="text-orange-400 font-semibold">৳${data.price || '0'}</span> | অফার: <span class="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-orange-500/20">${data.offerType || 'General'}</span></p>
                </div>
              </div>
              <div class="flex gap-2 shrink-0">
                <button onclick="window.editProduct('${docSnap.id}', '${data.category || ''}', '${title.replace(/'/g, "\\'")}', '${data.price || ''}', '${data.offerType || ''}', '${img}')" class="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-xl text-xs font-bold transition border border-blue-500/20">এডিট</button>
                <button onclick="window.deleteProduct('${docSnap.id}')" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition border border-red-500/20">ডিলিট</button>
              </div>
            </div>
          `;
        });
      } catch (error) {
        console.error("Error loading products: ", error);
        productList.innerHTML = '<p class="text-xs text-red-400 text-center py-6">ডাটা লোড করতে সমস্যা হয়েছে।</p>';
      }
    }

    window.editProduct = function(id, category, name, price, offerType, image) {
      document.getElementById('product-id').value = id;
      categorySelect.value = category;
      document.getElementById('p-name').value = name;
      document.getElementById('p-price').value = price;
      document.getElementById('p-offer-type').value = offerType;
      document.getElementById('p-image').value = image;
      document.getElementById('form-title').innerHTML = '<span>✏️</span> প্রোডাক্ট এডিট করুন';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.deleteProduct = async function(id) {
      if(confirm('আপনি কি এই গিফট প্রোডাক্টটি ডিলিট করতে চান?')) {
        try {
          // ডিলিট করার সময়ও 'gifts' কালেকশন নির্দেশ করা হয়েছে
          await deleteDoc(doc(db, "gifts", id));
          loadProducts();
        } catch (error) {
          console.error("Error deleting document: ", error);
          alert('ডিলিট করতে সমস্যা হয়েছে!');
        }
      }
    }

    loadCategories();
    loadProducts();
  </script>
</body>
</html>

