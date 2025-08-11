'use client';

import { RegisterForm } from '@/components/RegisterForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSuccess = () => {
    router.push('/users');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </div>
  );
}