import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JadwalUjian() {
    const navigate = useNavigate();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isScheduleSet, setIsScheduleSet] = useState(false);

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/schedule`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (response.ok) {
                setIsScheduleSet(true);
                const resData = await response.json();
                if (resData.success) {
                    setSchedule(resData.data.published_at);
                } else {
                    setError(resData.message || 'Gagal mengambil data jadwal.');
                }
            } else {
                setError('Terjadi kesalahan pada server saat mengambil jadwal.');
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    }, []);

    const generateSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (response.ok) {
                fetchSchedule();
                setIsScheduleSet(false);
            } else {
                setError('Gagal menghapus jadwal.');
            }

        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    }, [fetchSchedule]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">

                {/* Left Section */}
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight">
                        Jadwal Pengumuman
                    </h1>

                    <p className="mt-1 text-sm text-text-muted">
                        Informasi jadwal pengumuman kelulusan calon siswa baru.
                    </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">

                    <button
                        onClick={generateSchedule}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 bg-red-600 text-white font-medium hover:bg-red-700 hover:border-rose-300 transition-all duration-200"
                    >
                        Hapus Jadwal
                    </button>

                    <button
                        onClick={() => navigate('/jadwal-ujian/tambah')}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-all duration-200"
                    >
                        {isScheduleSet ? 'Tambah Jadwal' : 'Ubah Jadwal +'}
                    </button>

                </div>
            </div>

            {
                loading ? (
                    <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-border">
                        <Loader2 size={40} className="animate-spin text-brand mb-4" />
                        <p className="text-text-muted text-sm font-semibold">Memuat jadwal pengumuman...</p>
                    </div>
                ) : error ? (
                    <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-rose-200 bg-rose-50/50">
                        <AlertCircle size={40} className="text-rose-500 mb-4" />
                        <p className="text-rose-700 text-sm font-bold mb-4">{error}</p>
                        <button
                            onClick={fetchSchedule}
                            className="px-4 py-2 bg-white border border-rose-200 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
                        <div className="bg-bg-card p-8 rounded-[24px] shadow-sm border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-50"></div>

                            <div className="w-20 h-20 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                                <Calendar size={40} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2 relative z-10">Jadwal Publish Pengumuman</h3>

                            {schedule ? (
                                <div className="relative z-10 flex items-center justify-center gap-3 mt-2">
                                    <Clock className="text-amber-500" size={24} />
                                    <span className="text-[24px] font-extrabold text-text-main">{schedule}</span>
                                </div>
                            ) : (
                                <div className="relative z-10 mt-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
                                    <span className="text-sm font-semibold text-slate-500">Jadwal belum ditentukan</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
