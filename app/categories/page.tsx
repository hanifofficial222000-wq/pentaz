import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default async function AllCategoriesPage() {
  const snap = await getDocs(collection(db, 'mainCategories'));
  const categories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">সকল ক্যাটাগরি</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat: any) => (
          <Link href={`/categories/${cat.slug}`} key={cat.id} className="p-4 border rounded-lg hover:shadow-lg">
            <img src={cat.icon} className="w-16 h-16 mx-auto mb-2" />
            <p className="text-center font-medium">{cat.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

