'use client';

import { LoginForm } from '@/modules/user/components';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const handleLoginSuccess = () => {
        router.push('/users');
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full">
                <LoginForm onSuccess={handleLoginSuccess} />
            </div>
        </div>
    );
}