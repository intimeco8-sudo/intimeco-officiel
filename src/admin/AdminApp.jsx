import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import PromoCodes from './pages/PromoCodes';
import Settings from './pages/Settings';
import AdminNav from './components/AdminNav';

function isAdminSession(session) {
    const metadata = session?.user?.app_metadata || {};
    return metadata.role === 'admin' || metadata.admin === true;
}

export default function AdminApp() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setCurrentPage('dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDE8EC] flex items-center justify-center">
                <p className="font-sans text-[#1C2340]">Chargement...</p>
            </div>
        );
    }

    if (!session || !isAdminSession(session)) {
        return <Login onSuccess={(session) => setSession(session)} />;
    }

    return (
        <div className="min-h-screen bg-[#FDE8EC]">
            <AdminNav
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                userEmail={session.user.email}
                onLogout={handleLogout}
            />
            <main className="max-w-screen-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {currentPage === 'dashboard' && <Dashboard />}
                {currentPage === 'orders' && <Orders />}
                {currentPage === 'products' && <Products />}
                {currentPage === 'promos' && <PromoCodes />}
                {currentPage === 'settings' && <Settings />}
            </main>
        </div>
    );
}
