import {LogOut} from 'lucide-react';
import {useRouter} from 'next/navigation';
import './AdminHeader.css'

export default function AdminHeader() {
    const router = useRouter();
    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <header className="admin-header">
            <h3></h3>
            <LogOut onClick={handleLogout} className="icon cursor-pointer"/>
        </header>
    );
}
