import { NextResponse } from 'next/server';
// নোড জেএস এনভায়রনমেন্টে ফায়ারবেস Admin SDK ব্যবহার করতে হয়
import admin from 'firebase-admin';

// ফায়ারবেস অ্যাডমিন একবার ইনিশিয়ালাইজ করা আছে কি না চেক করা
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(req) {
  try {
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
