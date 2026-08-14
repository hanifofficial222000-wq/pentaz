import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface PageProps {
  params: Promise<{
    slug: string;
    subSlug: string;
  }>;
}

export default async function SubCategoryPage({ params }: PageProps) {
  const { subSlug } = await params;

  // প্রোডাক্ট ফেচ করা
  const q = query(collection(db, 'products'), where('subCategorySlug', '==', subSlug));
  const snap = await getDocs(q);
  const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 capitalize">{subSlug.replace('-', ' ')} এর প্রোডাক্টসমূহ</h1>
      
      {products.length === 0 ? (
        <p>এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((prod) => (
            <div key={prod.id} className="border p-4 rounded bg-white shadow-sm">
              <img src={prod.image} alt={prod.name} className="w-full h-40 object-cover rounded" />
              <h2 className="font-semibold mt-2">{prod.name}</h2>
              <p className="text-orange-600 font-bold">{prod.price} SAR</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
