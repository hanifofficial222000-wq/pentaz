<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin - Customer Support & Reply</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen py-6 px-4 md:px-8">

  <!-- Header Banner -->
  <div class="max-w-3xl mx-auto bg-gradient-to-r from-slate-900 to-indigo-700 rounded-t-2xl p-6 text-white shadow-lg flex items-center justify-between">
    <div>
      <h1 class="text-xl md:text-2xl font-extrabold tracking-wide uppercase">AYAAT SPORT SHOP</h1>
      <p class="text-indigo-200 text-xs mt-1">কাস্টমার সাপোর্ট ও রিপ্লাই প্যানেল</p>
    </div>
    <a href="control-room.html" class="bg-white/25 hover:bg-white/35 text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-white/30 transition">
      <span>⚙️ কন্ট্রোল রুম</span>
    </a>
  </div>

  <!-- Main Container -->
  <div class="max-w-3xl mx-auto bg-white p-6 rounded-b-2xl shadow-xl space-y-6">
    
    <div id="alertBox" class="hidden p-3 rounded-xl text-center font-bold text-xs bg-green-100 text-green-700 border border-green-300">
      🎉 সফল!
    </div>

    <h3 class="text-md font-bold text-slate-800 flex items-center gap-2">
      💬 কাস্টমারদের প্রশ্ন ও উত্তরের তালিকা
    </h3>

    <!-- Questions & Support List Container -->
    <div id="adminSupportList" class="space-y-4">
      <div class="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
        প্রশ্নসমূহ লোড হচ্ছে...
      </div>
    </div>

  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyD3NXjyFRvir6EjTQz4nrDTQTQ8ESFpF8o",
      authDomain: "ayaat-shop.firebaseapp.com",
      projectId: "ayaat-shop",
      storageBucket: "ayaat-shop.firebasestorage.app",
      messagingSenderId: "762175348619",
      appId: "1:762175348619:web:9d547dfe03ebc76e92998e"
    };

    const db = getFirestore(initializeApp(firebaseConfig));
    const adminSupportList = document.getElementById('adminSupportList');
    const alertBox = document.getElementById('alertBox');

    function showAlert(msg) {
      alertBox.innerText = msg;
      alertBox.classList.remove('hidden');
      setTimeout(() => alertBox.classList.add('hidden'), 4000);
    }

    // কাস্টমারদের প্রশ্নগুলো লোড করার ফাংশন
    async function loadAdminSupportRequests() {
      try {
        const snap = await getDocs(collection(db, "support"));

        if (snap.empty) {
          adminSupportList.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">কোনো প্রশ্ন বা মেসেজ নেই।</div>`;
          return;
        }

        adminSupportList.innerHTML = "";
        snap.forEach(docSnap => {
          const item = docSnap.data();
          const docId = docSnap.id;
          const currentReply = item.reply || "";
          const customerPhone = item.customerPhone || "নম্বর নেই";

          adminSupportList.innerHTML += `
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <div class="flex justify-between items-center text-slate-500 font-semibold">
                <span>📞 কাস্টমার ফোন: <strong class="text-slate-800">${customerPhone}</strong></span>
                <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">${item.status || 'Pending'}</span>
              </div>
              
              <div class="bg-white p-3 rounded-lg border border-slate-100 text-slate-800 font-medium">
                ❓ প্রশ্ন: ${item.question || item.message}
              </div>

              <!-- Reply Form -->
              <div class="space-y-2 pt-2 border-t border-slate-200">
                <label class="block font-bold text-slate-700 text-[11px]">অ্যাডমিনের উত্তর লিখুন:</label>
                <textarea id="reply_${docId}" rows="2" placeholder="এখানে উত্তর লিখুন..." 
                          class="w-full border border-slate-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white">${currentReply}</textarea>
                
                <div class="flex items-center justify-between pt-1">
                  <button onclick="sendReply('${docId}')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer">
                    🚀 উত্তর পাঠান / আপডেট করুন
                  </button>
                  <button onclick="deleteQuestion('${docId}')" class="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-2 rounded-lg text-xs transition cursor-pointer">
                    🗑️ ডিলিট প্রশ্ন
                  </button>
                </div>
              </div>
            </div>
          `;
        });

      } catch (err) {
        console.error(err);
        adminSupportList.innerHTML = `<div class="text-center py-6 text-rose-500 text-xs bg-slate-50 rounded-xl border border-slate-200">ডাটা লোড করতে সমস্যা হয়েছে।</div>`;
      }
    }

    // উত্তর সেভ বা আপডেট করার ফাংশন
    window.sendReply = async function(docId) {
      const replyText = document.getElementById(`reply_${docId}`).value.trim();
      if(!replyText) {
        alert("দয়া করে কিছু উত্তর লিখুন!");
        return;
      }

      try {
        const docRef = doc(db, "support", docId);
        await updateDoc(docRef, {
          reply: replyText,
          status: "Resolved"
        });

        showAlert("🎉 উত্তর সফলভাবে পাঠানো হয়েছে!");
        loadAdminSupportRequests();
      } catch (err) {
        console.error(err);
        alert("⚠️ উত্তর পাঠাতে সমস্যা হয়েছে!");
      }
    };

    // প্রশ্ন এবং উত্তর সম্পূর্ণ ডিলিট করার ফাংশন
    window.deleteQuestion = async function(docId) {
      if(confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্ন এবং উত্তরটি ডিলিট করতে চান?")) {
        try {
          await deleteDoc(doc(db, "support", docId));
          showAlert("🗑️ সফলভাবে ডিলিট করা হয়েছে!");
          loadAdminSupportRequests();
        } catch (err) {
          console.error(err);
          alert("⚠️ ডিলিট করতে সমস্যা হয়েছে!");
        }
      }
    };

    loadAdminSupportRequests();
  </script>
</body>
</html>

