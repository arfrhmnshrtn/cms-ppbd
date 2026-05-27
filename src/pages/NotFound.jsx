import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center min-h-[70vh]">
            <div className="glass p-12 rounded-[32px] border border-border flex flex-col items-center text-center max-w-md shadow-sm">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[24px] flex items-center justify-center mb-6 shadow-inner rotate-3 hover:rotate-6 transition-all">
                    <AlertCircle size={48} strokeWidth={2} />
                </div>
                <h1 className="text-4xl font-black text-slate-800 mb-2">404</h1>
                <h2 className="text-xl font-bold text-slate-700 mb-4">Halaman Tidak Ditemukan</h2>
                <p className="text-slate-500 mb-8 font-medium">
                    Maaf, halaman atau parameter yang Anda tuju tidak tersedia atau telah dipindahkan.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-brand text-white font-semibold rounded-2xl shadow-[0_8px_20px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_25px_rgb(59,130,246,0.4)] hover:-translate-y-0.5 transition-all duration-300"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
}
