import { useState } from 'react';
import { supabase } from '../../supabase/client';
import { Lock } from 'lucide-react';

function isAdminSession(session) {
    const metadata = session?.user?.app_metadata || {};
    return metadata.role === 'admin' || metadata.admin === true;
}

export default function Login({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError('Identifiants incorrects');
            return;
        }

        if (data.session && isAdminSession(data.session)) {
            onSuccess(data.session);
            return;
        }

        await supabase.auth.signOut();
        setError('Acces admin non autorise');
    };

    return (
        <div className="min-h-screen bg-[#FDE8EC] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div
                        className="flex items-center justify-center rounded-full bg-[#1C2340]"
                        style={{ width: '64px', height: '64px' }}
                    >
                        <Lock size={28} color="white" strokeWidth={1.8} />
                    </div>
                    <h1 className="font-serif text-[#1C2340] text-center" style={{ fontSize: '28px', fontWeight: 600 }}>
                        Administration
                    </h1>
                    <p className="font-sans text-[#9CA3AF] text-center" style={{ fontSize: '14px' }}>
                        Intime & Co
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340] transition-colors"
                            style={{ fontSize: '15px' }}
                            placeholder="admin@intime.dz"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block font-sans font-semibold text-[#1C2340] mb-2" style={{ fontSize: '14px' }}>
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-[#EBB4BB] rounded-lg px-4 py-3 font-sans text-[#1C2340] outline-none focus:border-[#1C2340] transition-colors"
                            style={{ fontSize: '15px' }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="font-sans text-[#E63946] text-center" style={{ fontSize: '13px' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1C2340] text-white font-sans font-semibold rounded-full hover:bg-[#2D375F] transition-colors disabled:opacity-50"
                        style={{ height: '52px', fontSize: '15px', letterSpacing: '0.04em' }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}
