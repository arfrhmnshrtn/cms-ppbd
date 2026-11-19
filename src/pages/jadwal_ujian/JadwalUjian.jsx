import { useCallback, useEffect, useState } from "react";
import {
    Loader2,
    Calendar,
    Clock,
    MapPin,
    CalendarX,
    Trash2,
    AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function JadwalUjian() {
    const [jadwal, setJadwal] = useState([]);
    const [loadingJadwal, setLoadingJadwal] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // Form states
    const [tanggalTest, setTanggalTest] = useState("");
    const [jamTest, setJamTest] = useState("");
    const [lokasiTest, setLokasiTest] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const hasSchedule = jadwal.length > 0;

    const fetchJadwal = useCallback(async () => {
        setLoadingJadwal(true);
        try {
            const token = localStorage.getItem("tokenAdmin");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/cards/test-schedules`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setJadwal(Array.isArray(data.data) ? data.data : []);
            } else {
                console.error("Gagal mengambil data jadwal.");
                setJadwal([]);
            }
        } catch (err) {
            console.error("Error fetching jadwal:", err);
            setJadwal([]);
        } finally {
            setLoadingJadwal(false);
        }
    }, []);

    useEffect(() => {
        fetchJadwal();
    }, [fetchJadwal]);

    const createTestSchedule = async (e) => {
        e.preventDefault();

        if (hasSchedule) {
            Swal.fire({
                icon: "warning",
                title: "Jadwal Sudah Ada",
                text: "Tidak dapat menambah jadwal baru karena jadwal ujian sudah tersedia. Silakan hapus jadwal yang ada terlebih dahulu.",
            });
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem("tokenAdmin");
            const formattedTanggal = new Date(
                `${tanggalTest}T00:00:00.000Z`
            ).toISOString();

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/cards/test-schedules`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                    body: JSON.stringify({
                        tanggal_test: formattedTanggal,
                        jam_test: jamTest,
                        lokasi_test: lokasiTest,
                    }),
                }
            );

            const resData = await response.json().catch(() => ({}));

            if (response.ok) {
                setTanggalTest("");
                setJamTest("");
                setLokasiTest("");
                await Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text:
                        resData.message ||
                        "Jadwal ujian berhasil ditambahkan!",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchJadwal();
            } else {
                const msg =
                    resData.message || "Gagal menyimpan jadwal ujian.";
                setError(msg);
                Swal.fire({
                    icon: "error",
                    title: "Gagal Menambah Jadwal",
                    text: msg,
                });
            }
        } catch (err) {
            console.error("Error creating test schedule:", err);
            setError("Terjadi kesalahan jaringan atau server.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSchedule = async (id) => {
        const confirmResult = await Swal.fire({
            title: "Hapus Jadwal Ujian?",
            text: "Apakah Anda yakin ingin menghapus jadwal ujian ini? Setelah dihapus, Anda dapat membuat jadwal baru.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus Jadwal",
            cancelButtonText: "Batal",
        });

        if (!confirmResult.isConfirmed) return;

        setDeletingId(id ?? "all");
        setError(null);
        try {
            const token = localStorage.getItem("tokenAdmin");
            const endpoint = id
                ? `${import.meta.env.VITE_API_URL}/cards/test-schedules/${id}`
                : `${import.meta.env.VITE_API_URL}/cards/test-schedules`;

            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            });

            const resData = await response.json().catch(() => ({}));

            if (response.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "Terhapus",
                    text:
                        resData.message ||
                        "Jadwal ujian berhasil dihapus.",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchJadwal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal Menghapus",
                    text:
                        resData.message ||
                        "Gagal menghapus jadwal ujian.",
                });
            }
        } catch (err) {
            console.error("Error deleting test schedule:", err);
            Swal.fire({
                icon: "error",
                title: "Kesalahan Jaringan",
                text: "Terjadi kesalahan saat menghapus jadwal ujian.",
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight">
                        Jadwal Ujian
                    </h1>
                    <p className="mt-1 text-sm text-text-muted">
                        Atur dan kelola informasi jadwal pelaksanaan ujian tulis calon siswa baru.
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
                                    Tambah Jadwal Ujian
                                </h2>
                                <p className="text-xs text-text-muted">
                                    Isi tanggal, jam, dan lokasi ujian tulis.
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
                                    Jadwal ujian sudah tersedia. Anda tidak dapat menambah jadwal baru sebelum menghapus jadwal yang aktif di sebelah kanan.
                                </span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={createTestSchedule}
                            className="flex flex-col gap-5"
                        >
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="tanggal_test"
                                    className="text-sm font-semibold text-text-main"
                                >
                                    Tanggal Ujian
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar
                                            size={18}
                                            className="text-text-muted"
                                        />
                                    </div>
                                    <input
                                        type="date"
                                        id="tanggal_test"
                                        required
                                        disabled={hasSchedule || submitting}
                                        value={tanggalTest}
                                        onChange={(e) =>
                                            setTanggalTest(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="jam_test"
                                    className="text-sm font-semibold text-text-main"
                                >
                                    Jam Ujian
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock
                                            size={18}
                                            className="text-text-muted"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        id="jam_test"
                                        required
                                        disabled={hasSchedule || submitting}
                                        placeholder="08:00 - 10:00"
                                        value={jamTest}
                                        onChange={(e) =>
                                            setJamTest(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="lokasi_test"
                                    className="text-sm font-semibold text-text-main"
                                >
                                    Lokasi Ujian
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin
                                            size={18}
                                            className="text-text-muted"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        id="lokasi_test"
                                        required
                                        disabled={hasSchedule || submitting}
                                        placeholder="Lab Komputer Utama"
                                        value={lokasiTest}
                                        onChange={(e) =>
                                            setLokasiTest(e.target.value)
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
                                    ? "Jadwal Sudah Tersedia"
                                    : submitting
                                      ? "Menyimpan..."
                                      : "Simpan Jadwal"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sebelah Kanan: Daftar Hasil Jadwal */}
                <div className="lg:col-span-7">
                    {loadingJadwal ? (
                        <div className="glass border border-border p-12 flex flex-col items-center justify-center min-h-[280px]">
                            <Loader2
                                size={42}
                                className="animate-spin text-brand mb-4"
                            />
                            <h3 className="text-lg font-semibold text-text-main mb-1">
                                Memuat Jadwal
                            </h3>
                            <p className="text-sm text-text-muted text-center">
                                Mohon tunggu sebentar, data jadwal sedang diproses.
                            </p>
                        </div>
                    ) : jadwal.length === 0 ? (
                        <div className="glass border border-border p-12 flex flex-col items-center justify-center min-h-[280px] text-center">
                            <div className="w-16 h-16 bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                                <CalendarX size={34} />
                            </div>
                            <h3 className="text-lg font-bold text-text-main mb-1">
                                Jadwal Masih Kosong
                            </h3>
                            <p className="text-sm text-text-muted max-w-md">
                                Belum ada jadwal ujian yang dibuat. Silakan tambahkan jadwal ujian melalui form di sebelah kiri.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {jadwal.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    className="glass border border-border p-7 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-brand font-bold mb-2">
                                                    Jadwal Ujian Aktif
                                                </p>
                                                <h2 className="text-xl font-bold text-text-main">
                                                    {item.tanggal_test_formatted ||
                                                        item.tanggal_test}
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
                                                    Jam
                                                </span>
                                                <span className="font-semibold text-text-main">
                                                    {item.jam_test}
                                                </span>
                                            </div>

                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-sm text-text-muted">
                                                    Lokasi
                                                </span>
                                                <span className="font-semibold text-right text-text-main">
                                                    {item.lokasi_test}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tombol Hapus Jadwal */}
                                    <div className="mt-6 pt-4 border-t border-border">
                                        <button
                                            type="button"
                                            disabled={deletingId === item.id}
                                            onClick={() =>
                                                handleDeleteSchedule(item.id)
                                            }
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {deletingId === item.id ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                            <span>
                                                {deletingId === item.id
                                                    ? "Menghapus..."
                                                    : "Hapus Jadwal"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
