import { useState, useEffect, useCallback } from 'react';
import {
    Calendar,
    Clock,
    AlertCircle,
    Loader2,
    CalendarX,
    Trash2,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function JadwalKelulusan() {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    // Form states
    const [date, setDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const hasSchedule = Boolean(schedule);

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/announcements/schedule`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    },
                }
            );

            if (response.ok) {
                const resData = await response.json();
                if (resData.success && resData.data?.published_at) {
                    setSchedule(resData.data.published_at);
                } else {
                    setSchedule(null);
                }
            } else {
                setSchedule(null);
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setSchedule(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleCreateSchedule = async (e) => {
        e.preventDefault();

        if (hasSchedule) {
            Swal.fire({
                icon: 'warning',
                title: 'Jadwal Sudah Ada',
                text: 'Tidak dapat menambah jadwal baru karena jadwal pengumuman sudah tersedia. Silakan hapus jadwal yang ada terlebih dahulu.',
            });
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('tokenAdmin');
            const publishedAt = new Date(date).toISOString();

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/announcements/schedule`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    },
                    body: JSON.stringify({ published_at: publishedAt }),
                }
            );

            const resData = await response.json().catch(() => ({}));

            if (response.ok && resData.success !== false) {
                setDate('');
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text:
                        resData.message ||
                        'Jadwal pengumuman kelulusan berhasil disimpan!',
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchSchedule();
            } else {
                const msg = resData.message || 'Gagal menyimpan jadwal.';
                setError(msg);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menyimpan Jadwal',
                    text: msg,
                });
            }
        } catch (err) {
            console.error('Error saving schedule:', err);
            setError('Terjadi kesalahan jaringan atau server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSchedule = async () => {
        const confirmResult = await Swal.fire({
            title: 'Hapus Jadwal Pengumuman?',
            text: 'Apakah Anda yakin ingin menghapus jadwal pengumuman ini? Setelah dihapus, Anda dapat membuat jadwal baru.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus Jadwal',
            cancelButtonText: 'Batal',
        });

        if (!confirmResult.isConfirmed) return;

        setDeleting(true);
        setError(null);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/announcements/generate`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                    },
                }
            );

            const resData = await response.json().catch(() => ({}));

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Terhapus',
                    text:
                        resData.message ||
                        'Jadwal pengumuman berhasil dihapus.',
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchSchedule();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menghapus',
                    text: resData.message || 'Gagal menghapus jadwal pengumuman.',
                });
            }
        } catch (err) {
            console.error('Error deleting schedule:', err);
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan Jaringan',
                text: 'Terjadi kesalahan saat menghapus jadwal pengumuman.',
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight">
                        Jadwal Pengumuman
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Atur dan kelola informasi jadwal pengumuman kelulusan calon siswa baru.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Samping Kiri: Form Tambah Jadwal */}
                <div className="lg:col-span-5">
                    <div className="bg-bg-card p-6 md:p-8 shadow-sm border border-border">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-brand/10 text-brand flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-text-main">
                                    Tambah Jadwal Pengumuman
                                </h2>
                                <p className="text-xs text-text-muted">
                                    Atur tanggal dan waktu publish pengumuman kelulusan.
                                </p>
                            </div>
                        </div>

                        {hasSchedule && (
                            <div className="mb-6 p-4 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-start gap-2.5">
                                <AlertCircle
                                    size={18}
                                    className="text-amber-600 flex-shrink-0 mt-0.5"
                                />
                                <span>
                                    Jadwal pengumuman sudah tersedia. Anda tidak dapat menambah jadwal baru sebelum menghapus jadwal yang aktif di sebelah kanan.
                                </span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleCreateSchedule}
                            className="flex flex-col gap-5"
                        >
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="date"
                                    className="text-sm font-semibold text-text-main"
                                >
                                    Tanggal dan Waktu Pengumuman
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar
                                            size={18}
                                            className="text-text-muted"
                                        />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        id="date"
                                        required
                                        disabled={hasSchedule || submitting}
                                        value={date}
                                        onChange={(e) =>
                                            setDate(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || hasSchedule}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {submitting && (
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                )}
                                {hasSchedule
                                    ? 'Jadwal Sudah Tersedia'
                                    : submitting
                                      ? 'Menyimpan...'
                                      : 'Simpan Jadwal'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sebelah Kanan: Hasil Jadwal Pengumuman */}
                <div className="lg:col-span-7">
                    {loading ? (
                        <div className="glass border border-border p-12 flex flex-col items-center justify-center min-h-[280px]">
                            <Loader2
                                size={42}
                                className="animate-spin text-brand mb-4"
                            />
                            <h3 className="text-lg font-semibold text-text-main mb-1">
                                Memuat Jadwal
                            </h3>
                            <p className="text-sm text-text-muted text-center">
                                Mohon tunggu sebentar, data jadwal pengumuman sedang diproses.
                            </p>
                        </div>
                    ) : !schedule ? (
                        <div className="glass border border-border p-12 flex flex-col items-center justify-center min-h-[280px] text-center">
                            <div className="w-16 h-16 bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                                <CalendarX size={34} />
                            </div>
                            <h3 className="text-lg font-bold text-text-main mb-1">
                                Jadwal Masih Kosong
                            </h3>
                            <p className="text-sm text-text-muted max-w-md">
                                Belum ada jadwal pengumuman kelulusan yang dibuat. Silakan tambahkan jadwal pengumuman melalui form di sebelah kiri.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="glass border border-border p-7 transition-all duration-300 group flex flex-col justify-between">
                                <div>
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-brand font-bold mb-2">
                                                Jadwal Publish Pengumuman Aktif
                                            </p>
                                            <h2 className="text-xl font-bold text-text-main flex items-center gap-2.5">
                                                <Clock
                                                    size={20}
                                                    className="text-amber-500 flex-shrink-0"
                                                />
                                                <span>{schedule}</span>
                                            </h2>
                                        </div>

                                        <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 bg-brand/10 transition">
                                            <Calendar
                                                size={22}
                                                className="text-brand"
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <span className="text-sm text-text-muted">
                                                Status Jadwal
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                Terjadwal
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-4">
                                            <span className="text-sm text-text-muted">
                                                Waktu Publish
                                            </span>
                                            <span className="font-semibold text-right text-text-main">
                                                {schedule}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tombol Hapus Jadwal */}
                                <div className="mt-6 pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        disabled={deleting}
                                        onClick={handleDeleteSchedule}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {deleting ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                        <span>
                                            {deleting
                                                ? 'Menghapus...'
                                                : 'Hapus Jadwal'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
