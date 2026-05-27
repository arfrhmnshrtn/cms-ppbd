import { useCallback, useEffect, useState } from "react";
import { Loader2, Calendar } from "lucide-react";

export default function JadwalUjian() {

    const [jadwal, setJadwal] = useState([]);

    const fetchJadwal = useCallback(async () => {
        const token = localStorage.getItem('tokenAdmin');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cards/test-schedules`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }

        });

        if (response.ok) {
            const data = await response.json();
            setJadwal(data.data);
        } else {
            console.error('Gagal mengambil data jadwal.');
        }
    }, []);

    useEffect(() => {
        fetchJadwal();
    }, [fetchJadwal]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">

                {/* Left Section */}
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight">
                        Jadwal Ujian
                    </h1>

                    <p className="mt-1 text-sm text-text-muted">
                        Informasi jadwal pelaksanaan ujian tulis calon siswa baru.
                    </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">

                    <button
                        // onClick={() => navigate('/jadwal-ujian/tambah')}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                    >
                        {/* {isScheduleSet ? 'Tambah Jadwal' : 'Ubah Jadwal +'} */}
                        Tambah Jadwal
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jadwal.length === 0 ? (
                    <div className="col-span-full">
                        <div className="glass rounded-3xl border border-border p-12 flex flex-col items-center justify-center min-h-[260px]">
                            <Loader2
                                size={42}
                                className="animate-spin text-brand mb-5"
                            />

                            <h3 className="text-lg font-semibold text-text-main mb-1">
                                Memuat Jadwal
                            </h3>

                            <p className="text-sm text-text-muted text-center">
                                Mohon tunggu sebentar, data jadwal sedang diproses.
                            </p>
                        </div>
                    </div>
                ) : (
                    jadwal.map((item, index) => (
                        <div
                            key={index}
                            className="
                    glass
                    rounded-3xl
                    border border-border
                    p-8
                    transition-all
                    duration-300
                    group
                "
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-brand font-bold mb-2">
                                        Jadwal Ujian
                                    </p>

                                    <h2 className="text-2xl font-bold text-text-main">
                                        {item.tanggal_test_formatted}
                                    </h2>
                                </div>

                                <div
                                    className="
                            w-14 h-14
                            rounded-2xl
                            flex items-center justify-center
                            group-hover:scale-110
                            bg-brand/10
                            transition
                        "
                                >
                                    <Calendar size={24} className="text-brand" />
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
                    ))
                )}
            </div>

            {/* <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-border">
                <Loader2 size={40} className="animate-spin text-brand mb-4" />
                <p className="text-text-muted text-sm font-semibold">Memuat jadwal pengumuman...</p>
            </div> */}
        </div>
    );
}