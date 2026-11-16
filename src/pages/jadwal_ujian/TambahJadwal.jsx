import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TambahJadwalUjian() {
    const navigate = useNavigate();
    const [tanggalTest, setTanggalTest] = useState('');
    const [jamTest, setJamTest] = useState('');
    const [lokasiTest, setLokasiTest] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createTestSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('tokenAdmin');
            const formattedTanggal = new Date(`${tanggalTest}T00:00:00.000Z`).toISOString();

            const response = await fetch(`${import.meta.env.VITE_API_URL}/cards/test-schedules`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    tanggal_test: formattedTanggal,
                    jam_test: jamTest,
                    lokasi_test: lokasiTest
                })
            });

            const resData = await response.json().catch(() => ({}));

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: resData.message || 'Jadwal ujian berhasil ditambahkan!',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate('/jadwal-ujian');
            } else {
                setError(resData.message || 'Gagal menyimpan jadwal ujian.');
            }
        } catch (err) {
            console.error('Error creating test schedule:', err);
            setError('Terjadi kesalahan jaringan atau server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight">
                        Tambah Jadwal Ujian
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Atur tanggal, jam, dan lokasi pelaksanaan ujian tulis calon siswa baru.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/jadwal-ujian')}
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

                <form onSubmit={createTestSchedule} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="tanggal_test" className="text-sm font-semibold text-text-main">
                            Tanggal Ujian
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar size={18} className="text-text-muted" />
                            </div>
                            <input
                                type="date"
                                id="tanggal_test"
                                required
                                value={tanggalTest}
                                onChange={(e) => setTanggalTest(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="jam_test" className="text-sm font-semibold text-text-main">
                            Jam Ujian
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock size={18} className="text-text-muted" />
                            </div>
                            <input
                                type="text"
                                id="jam_test"
                                required
                                placeholder="08:00 - 10:00"
                                value={jamTest}
                                onChange={(e) => setJamTest(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="lokasi_test" className="text-sm font-semibold text-text-main">
                            Lokasi Ujian
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin size={18} className="text-text-muted" />
                            </div>
                            <input
                                type="text"
                                id="lokasi_test"
                                required
                                placeholder="Lab Komputer Utama"
                                value={lokasiTest}
                                onChange={(e) => setLokasiTest(e.target.value)}
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
