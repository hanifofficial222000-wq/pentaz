import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default async function SubCategoryPage({ params }: { params: Promise<{ slug: string; subSlug: string }> }) {
  const { slug, subSlug } = await params;

  // প্রোডাক্ট ফেচ করা (যেখানে সাব-ক্যাটাগরি স্লাগ ম্যাচ করে)
  const q = query(collection(db, 'products'), where('subCategorySlug', '==', subSlug));
  const snap = await getDocs(q);
  const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 capitalize">{subSlug.replace('-', ' ')} এর প্রোডাক্টসমূহ</h1>
      
      {products.length === 0 ? (
        <p>এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((prod: any) => (
            <div key={prod.id} className="border p-4 rounded">
              <img src={prod.image} className="w-full h-40 object-cover" />
              <h2 className="font-semibold mt-2">{prod.name}</h2>
              <p className="text-orange-600">{prod.price} SAR</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

