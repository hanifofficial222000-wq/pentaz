import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default async function MainCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // সাব-ক্যাটাগরি ফেচ করা
  const q = query(collection(db, 'subCategories'), where('mainCategorySlug', '==', slug));
  const snap = await getDocs(q);
  const subCats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 capitalize">{slug.replace('-', ' ')} ক্যাটাগরি</h1>
      <div className="grid grid-cols-3 gap-4">
        {subCats.map((sub: any) => (
          <Link href={`/categories/${slug}/${sub.slug}`} key={sub.id} className="border p-4 rounded text-center">
            <img src={sub.icon} className="w-12 h-12 mx-auto" />
            <p className="mt-2 text-sm">{sub.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

