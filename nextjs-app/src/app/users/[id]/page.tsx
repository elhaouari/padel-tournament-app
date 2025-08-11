import { UserProfilePageWrapper } from '@/modules/user/pages/UserProfilePage';

interface UserProfileRouteProps {
    params: { id: string };
}

export default function UserProfileRoute({ params }: UserProfileRouteProps) {
    return <UserProfilePageWrapper params={params} />;
}