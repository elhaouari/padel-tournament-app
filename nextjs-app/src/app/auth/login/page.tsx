'use client';

import { LoginForm } from '@/components/LoginForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/users');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}