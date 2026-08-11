'use client';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // lib থেকে ইমপোর্ট

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // সফল হলে ড্যাশবোর্ডে চলে যাবে
    } catch (error) {
      alert("লগইন ব্যর্থ হয়েছে: " + error.message);
    }
  };

  return (
    // আপনার লগইন ফর্মের কোড
  );
}
