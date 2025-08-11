'use client';

import { RegisterForm } from '@/modules/user/components';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const handleRegisterSuccess = () => {
        router.push('/users');
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full">
                <RegisterForm onSuccess={handleRegisterSuccess} />
            </div>
        </div>
    );
}