import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TambahJadwal() {
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('tokenAdmin');
            const publishedAt = new Date(date).toISOString();

            const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/schedule`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ published_at: publishedAt })
            });

            const resData = await response.json().catch(() => ({}));

            if (response.ok && resData.success !== false) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: resData.message || 'Jadwal pengumuman kelulusan berhasil disimpan!',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate('/jadwal-kelulusan');
            } else {
                setError(resData.message || 'Gagal menyimpan jadwal.');
            }
        } catch (err) {
            console.error('Error saving schedule:', err);
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight">
                        Tambah Jadwal Pengumuman
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Atur tanggal dan waktu pengumuman.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/jadwal-kelulusan')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 transition-all duration-200"
                >
                    Kembali
                </button>
            </div>

            <div className="max-w-xl bg-bg-card p-8 rounded-[24px] shadow-sm border border-border">
                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="date" className="text-sm font-semibold text-text-main">
                            Tanggal dan Waktu Pengumuman
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={18} className="text-text-muted" />
                            </div>
                            <input
                                type="datetime-local"
                                id="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
                    </button>
                </form>
            </div>
        </div>
    );
}
