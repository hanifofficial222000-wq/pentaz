<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin - Returns Management</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen py-6 px-4 md:px-8">

  <!-- Header Banner -->
  <div class="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-red-600 rounded-t-2xl p-6 text-white shadow-lg relative flex items-center justify-between">
    <div>
      <h1 class="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
      <p class="text-red-200 text-xs mt-1">অ্যাডমিন রিটার্ন ম্যানেজমেন্ট প্যানেল</p>
    </div>
    <a href="control-room.html" class="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition shadow-sm cursor-pointer">
      <span>⚙️ কন্ট্রোল রুম</span>
    </a>
  </div>

  <!-- Main Container -->
  <div class="max-w-3xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
    
    <div id="alertBox" class="hidden p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
      🎉 সফল!
    </div>

    <!-- RETURNS MANAGEMENT -->
    <div class="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm">
      <h3 class="text-lg font-bold text-red-900 mb-1 flex items-center gap-2">
        🔄 কাস্টমার রিটার্ন রিকোয়েস্টসমূহ
      </h3>
      <p class="text-xs text-red-700 mb-4">কাস্টমারদের পাঠানো রিটার্ন ও রিফান্ড রিকোয়েস্টগুলো ম্যানেজ করুন:</p>

      <div id="adminReturnsList" class="space-y-4">
        <p class="text-xs text-slate-400">রিটার্ন রিকোয়েস্ট লোড হচ্ছে...</p>
      </div>
    </div>

  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyD3NXjyFRvir6EjTQz4nrDTQTQ8ESFpF8o",
      authDomain: "ayaat-shop.firebaseapp.com",
      projectId: "ayaat-shop",
      storageBucket: "ayaat-shop.firebasestorage.app",
      messagingSenderId: "762175348619",
      appId: "1:762175348619:web:9d547dfe03ebc76e92998e"
    };

    const db = getFirestore(initializeApp(firebaseConfig));
    const adminReturnsList = document.getElementById('adminReturnsList');
    const alertBox = document.getElementById('alertBox');

    function showAlert(msg) {
      alertBox.innerText = msg;
      alertBox.classList.remove('hidden');
      setTimeout(() => alertBox.classList.add('hidden'), 4000);
    }

    async function loadAdminReturns() {
      try {
        const q = query(collection(db, "returns"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        adminReturnsList.innerHTML = '';

        if (snapshot.empty) {
          adminReturnsList.innerHTML = '<p class="text-xs text-slate-500">কোনো রিটার্ন রিকোয়েস্ট নেই।</p>';
          return;
        }

        snapshot.forEach((docSnap) => {
          const item = docSnap.data();
          const docId = docSnap.id;
          
          let statusBg = 'bg-amber-100 text-amber-800';
          if (item.status === 'Approved') statusBg = 'bg-emerald-100 text-emerald-700';
          else if (item.status === 'Cancelled') statusBg = 'bg-red-100 text-red-700';

          // Cloudinary ইমেজ লিংক নিশ্চিত করার জন্য
          let productImg = item.imageUrl ? item.imageUrl : 'https://via.placeholder.com/60?text=No+Image';

          adminReturnsList.innerHTML += `
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div class="flex items-center gap-3">
                  <a href="${productImg}" target="_blank" title="বড় করে দেখুন">
                    <img src="${productImg}" class="w-14 h-14 rounded-lg object-cover border border-slate-300 shadow-sm hover:opacity-90 transition" alt="Product Image">
                  </a>
                  <div>
                    <h4 class="font-bold text-xs text-slate-800">প্রোডাক্ট আইডি: #${item.productId}</h4>
                    <p class="text-[11px] text-red-600 font-bold">নাম: ${item.customerName}</p>
                  </div>
                </div>
                <span class="text-[11px] px-2.5 py-1 rounded-full font-bold ${statusBg}">${item.status || 'Pending'}</span>
              </div>

              <div class="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border">
                <p>📞 <b>ফোন:</b> <a href="https://wa.me/${item.customerPhone}" target="_blank" class="text-blue-600 underline font-bold">${item.customerPhone}</a></p>
                <p>⚠️ <b>কারণ:</b> ${item.reason}</p>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1">
                <button onclick="updateReturnStatus('${docId}', 'Approved')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer text-center">✅ Approve (গ্রহণ)</button>
                <button onclick="updateReturnStatus('${docId}', 'Cancelled')" class="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition cursor-pointer text-center">❌ Cancel (বাতিল)</button>
              </div>

              <button onclick="deleteReturnRecord('${docId}')" class="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-2 rounded-lg transition cursor-pointer text-center">🗑️ ডিলিট করুন (Delete)</button>
            </div>
          `;
        });
      } catch (err) {
        console.error("Error loading returns:", err);
        adminReturnsList.innerHTML = '<p class="text-xs text-red-500">ডাটা লোড করতে সমস্যা হয়েছে।</p>';
      }
    }

    window.updateReturnStatus = async function(docId, newStatus) {
      try {
        await updateDoc(doc(db, "returns", docId), { status: newStatus });
        showAlert(`🎉 রিটার্ন রিকোয়েস্ট '${newStatus}' করা হয়েছে!`);
        loadAdminReturns();
      } catch(err) {
        alert("⚠️ স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!");
      }
    };

    window.deleteReturnRecord = async function(docId) {
      if(confirm("আপনি কি নিশ্চিতভাবে এই রিটার্ন রিকোয়েস্টটি চিরতরে ডিলিট করতে চান?")) {
        try {
          await deleteDoc(doc(db, "returns", docId));
          showAlert("🗑️ রিটার্ন রিকোয়েস্ট সফলভাবে ডিলিট করা হয়েছে!");
          loadAdminReturns();
        } catch(err) {
          console.error(err);
          alert("⚠️ ডিলিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        }
      }
    };

    loadAdminReturns();
  </script>
</body>
</html>

