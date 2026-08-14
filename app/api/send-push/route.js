import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // বিল্ড ক্র্যাশ এড়াতে ফায়ারবেস অ্যাডমিন ডাইনামিকালি লোড করা হলো
    const admin = (await import('firebase-admin')).default;

    // যদি আগে থেকে ইনিশিয়ালাইজ করা না থাকে, তবে ইনিশিয়ালাইজ করুন
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const { tokens, title, body, imageUrl } = await req.json();

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: "No tokens provided" }, { status: 400 });
    }

    // ফায়ারবেস মাল্টিকাস্ট মেসেজ স্ট্রাকচার
    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl }),
      },
      tokens: tokens, // একসঙ্গে সব ইউজারের টোকেন অ্যারে
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return NextResponse.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount 
    });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
