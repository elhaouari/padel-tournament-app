import { UserEditPageWrapper } from '@/modules/user/pages/UserEditPage';

interface EditUserRouteProps {
    params: { id: string };
}

export default function EditUserRoute({ params }: EditUserRouteProps) {
    return <UserEditPageWrapper params={params} />;
}