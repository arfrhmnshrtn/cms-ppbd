import { useState, useEffect, useCallback } from 'react';
import {
    Play,
    RefreshCw,
    Users,
    CheckCircle2,
    XCircle,
    Award,
    Filter,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';

const MAJORS = [
    { id: '', name: 'Semua Jurusan' },
    { id: 'AK', name: 'Akuntansi (AK)' },
    { id: 'ATP', name: 'Agribisnis Tanaman Perkebunan (ATP)' },
    { id: 'DKV', name: 'Desain Komunikasi Visual (DKV)' },
    { id: 'TKJ', name: 'Teknik Komputer Jaringan (TKJ)' },
    { id: 'TKR', name: 'Teknik Kendaraan Ringan (TKR)' },
];

export default function SeleksiPenerimaan() {
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState(null);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Filter & Pagination
    const [jurusan, setJurusan] = useState('');
    const [jalurPenerimaan, setJalurPenerimaan] = useState('');
    const [statusAkhir, setStatusAkhir] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchSelectionResults = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(limit));
            if (jurusan) params.set('jurusan', jurusan);
            if (jalurPenerimaan) params.set('jalur_penerimaan', jalurPenerimaan);
            if (statusAkhir) params.set('status_akhir', statusAkhir);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/rankings/seleksi?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data hasil seleksi');
            }

            const resData = await response.json();
            setResults(resData.data || []);
            setSummary(resData.summary || null);
            setMeta(resData.metadata || null);
        } catch (error) {
            console.error('Error fetching selection results:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [page, jurusan, jalurPenerimaan, statusAkhir]);

    useEffect(() => {
        setPage(1);
    }, [jurusan, jalurPenerimaan, statusAkhir]);

    useEffect(() => {
        fetchSelectionResults();
    }, [fetchSelectionResults]);

    const handleRunSelection = async () => {
        const confirmResult = await Swal.fire({
            title: 'Proses Seleksi Penerimaan?',
            html: `
                <div style="text-align:left;font-size:14px;line-height:1.6;">
                    <p>Sistem akan menjalankan seleksi dua tahap secara otomatis:</p>
                    <ol style="margin-top:8px;padding-left:18px;">
                        <li><b>Tahap 1:</b> Seleksi berdasarkan Jurusan Pilihan 1 &amp; kuota masing-masing jurusan.</li>
                        <li><b>Tahap 2:</b> Kandidat yang tidak lolos Pilihan 1 akan diseleksi pada Jurusan Pilihan 2 menggunakan sisa kuota.</li>
                    </ol>
                    <p style="margin-top:8px;color:#475569;">Hasil seleksi sebelumnya akan dihitung ulang dari data nilai terbaru.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Proses Seleksi Sekarang',
            cancelButtonText: 'Batal',
        });

        if (!confirmResult.isConfirmed) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/rankings/seleksi`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                        'Content-Type': 'application/json',
                    },
                },
            );

            const resData = await response.json();
            if (!response.ok || !resData.success) {
                throw new Error(
                    resData.message || 'Gagal memproses seleksi penerimaan',
                );
            }

            const sum = resData.data?.summary;
            await Swal.fire({
                icon: 'success',
                title: 'Proses Seleksi Selesai!',
                html: `
                    <div style="font-size:14px;line-height:1.6;">
                        <p>Total Peserta Seleksi: <b>${sum?.total_peserta_seleksi ?? 0} siswa</b></p>
                        <p>Diterima Pilihan 1: <b>${sum?.total_diterima_pilihan_1 ?? 0}</b> | Diterima Pilihan 2: <b>${sum?.total_diterima_pilihan_2 ?? 0}</b></p>
                        <p>Tidak Diterima: <b>${sum?.total_tidak_diterima ?? 0}</b></p>
                    </div>
                `,
                confirmButtonColor: '#2563eb',
            });

            fetchSelectionResults();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Proses Seleksi Gagal',
                text:
                    error.message ||
                    'Terjadi kesalahan saat memproses seleksi penerimaan.',
            });
        } finally {
            setProcessing(false);
        }
    };

    const totalPages = meta?.total_pages || 1;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header & Tombol Proses Seleksi */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-text-main mb-1">
                        Seleksi Penerimaan Siswa Baru
                    </h1>
                    <p className="text-text-muted text-[14px]">
                        Seleksi bertahap dua pilihan jurusan berdasarkan nilai akhir, nilai rapor, dan kuota jurusan.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRunSelection}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                    {processing ? (
                        <RefreshCw size={18} className="animate-spin" />
                    ) : (
                        <Play size={18} />
                    )}
                    <span>
                        {processing
                            ? 'MEMPROSES SELEKSI...'
                            : 'PROSES SELEKSI PENERIMAAN'}
                    </span>
                </button>
            </div>

            {/* Ringkasan Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-bg-card p-5 rounded-[18px] border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-text-muted uppercase">
                            Total Peserta Seleksi
                        </span>
                        <p className="text-2xl font-extrabold text-text-main mt-1">
                            {summary?.total_peserta_seleksi ?? 0}
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Users size={22} />
                    </div>
                </div>

                <div className="bg-bg-card p-5 rounded-[18px] border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-emerald-700 uppercase">
                            Diterima Pilihan 1
                        </span>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                            {summary?.total_diterima_pilihan_1 ?? 0}
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={22} />
                    </div>
                </div>

                <div className="bg-bg-card p-5 rounded-[18px] border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-blue-700 uppercase">
                            Diterima Pilihan 2
                        </span>
                        <p className="text-2xl font-extrabold text-blue-600 mt-1">
                            {summary?.total_diterima_pilihan_2 ?? 0}
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Award size={22} />
                    </div>
                </div>

                <div className="bg-bg-card p-5 rounded-[18px] border border-border shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-rose-700 uppercase">
                            Tidak Diterima
                        </span>
                        <p className="text-2xl font-extrabold text-rose-600 mt-1">
                            {summary?.total_tidak_diterima ?? 0}
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <XCircle size={22} />
                    </div>
                </div>
            </div>

            {/* Ringkasan Kuota Per Jurusan */}
            {summary?.kuota_per_jurusan && (
                <div className="bg-bg-card rounded-[18px] border border-border shadow-sm mb-6 overflow-hidden">
                    <div className="p-4 px-6 border-b border-border bg-slate-50">
                        <h2 className="text-sm font-extrabold text-text-main uppercase tracking-wider">
                            Ringkasan Kuota &amp; Daya Tampung Per Jurusan
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50/70 border-b border-border text-xs uppercase text-text-muted">
                                <tr>
                                    <th className="p-3 pl-6">Jurusan</th>
                                    <th className="p-3 text-center">Kuota Total</th>
                                    <th className="p-3 text-center">Diterima Pilihan 1</th>
                                    <th className="p-3 text-center">Diterima Pilihan 2</th>
                                    <th className="p-3 text-center">Kuota Terisi</th>
                                    <th className="p-3 pr-6 text-center">Sisa Kuota</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {summary.kuota_per_jurusan.map((q) => (
                                    <tr key={q.jurusan} className="hover:bg-slate-50/50">
                                        <td className="p-3 pl-6 font-extrabold text-brand">
                                            {q.jurusan}
                                        </td>
                                        <td className="p-3 text-center font-bold">
                                            {q.kuota_total}
                                        </td>
                                        <td className="p-3 text-center font-semibold text-emerald-700">
                                            {q.diterima_pilihan_1}
                                        </td>
                                        <td className="p-3 text-center font-semibold text-blue-700">
                                            {q.diterima_pilihan_2}
                                        </td>
                                        <td className="p-3 text-center font-bold text-text-main">
                                            {q.kuota_terisi}
                                        </td>
                                        <td className="p-3 pr-6 text-center">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    q.sisa_kuota > 0
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {q.sisa_kuota}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-bg-card p-4 px-6 rounded-[18px] mb-6 shadow-sm border border-border flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                    <Filter size={16} className="text-brand" />
                    <span>Filter:</span>
                </div>

                <select
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    className="bg-bg-soft border border-border px-3.5 py-2 rounded-xl text-sm text-text-main outline-none focus:border-brand cursor-pointer"
                >
                    {MAJORS.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>

                <select
                    value={jalurPenerimaan}
                    onChange={(e) => setJalurPenerimaan(e.target.value)}
                    className="bg-bg-soft border border-border px-3.5 py-2 rounded-xl text-sm text-text-main outline-none focus:border-brand cursor-pointer"
                >
                    <option value="">Semua Jalur Penerimaan</option>
                    <option value="PILIHAN_1">Pilihan 1</option>
                    <option value="PILIHAN_2">Pilihan 2</option>
                </select>

                <select
                    value={statusAkhir}
                    onChange={(e) => setStatusAkhir(e.target.value)}
                    className="bg-bg-soft border border-border px-3.5 py-2 rounded-xl text-sm text-text-main outline-none focus:border-brand cursor-pointer"
                >
                    <option value="">Semua Status Akhir</option>
                    <option value="DITERIMA">Diterima</option>
                    <option value="TIDAK_DITERIMA">Tidak Diterima</option>
                </select>
            </div>

            {/* Tabel Hasil Seleksi */}
            {loading ? (
                <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-border">
                    <AlertCircle size={40} className="animate-spin text-brand mb-4" />
                    <p className="text-text-muted text-sm font-semibold">
                        Memuat hasil seleksi penerimaan...
                    </p>
                </div>
            ) : (
                <div className="glass rounded-[20px] overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-50 border-b border-border text-text-muted uppercase">
                                <tr>
                                    <th className="p-4 pl-6">No. Daftar</th>
                                    <th className="p-4">Nama Siswa</th>
                                    <th className="p-4 text-center">Pilihan 1</th>
                                    <th className="p-4 text-center">Pilihan 2</th>
                                    <th className="p-4 text-center">Nilai Akhir</th>
                                    <th className="p-4 text-center">Nilai Rapor</th>
                                    <th className="p-4 text-center">Rata-rata Rapor</th>
                                    <th className="p-4 text-center">Peringkat</th>
                                    <th className="p-4 text-center">Jurusan Diterima</th>
                                    <th className="p-4 text-center">Jalur</th>
                                    <th className="p-4 pr-6 text-center">Status Akhir</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {results.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="11"
                                            className="p-12 text-center text-text-muted text-sm font-semibold"
                                        >
                                            Belum ada data hasil seleksi. Silakan tekan tombol &ldquo;PROSES SELEKSI PENERIMAAN&rdquo;.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/60 transition-colors"
                                        >
                                            <td className="p-4 pl-6 font-bold text-brand">
                                                {item.no_daftar}
                                            </td>
                                            <td className="p-4 font-extrabold text-text-main text-sm">
                                                {item.nama}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                                                    {item.jurusan_pilihan_1}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.jurusan_pilihan_2 ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                                                        {item.jurusan_pilihan_2}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-extrabold text-blue-700">
                                                {Number(item.final_score).toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center font-semibold">
                                                {Number(item.nilai_rapor).toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center font-semibold">
                                                {Number(item.nilai_rata_rata_rapor).toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center font-extrabold text-text-main">
                                                #{item.ranking}
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.jurusan_diterima ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                                                        {item.jurusan_diterima}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.jalur_penerimaan === 'PILIHAN_1' ? (
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                                        Pilihan 1
                                                    </span>
                                                ) : item.jalur_penerimaan === 'PILIHAN_2' ? (
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                                                        Pilihan 2
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 text-center">
                                                {item.status_akhir === 'DITERIMA' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                                                        DITERIMA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-extrabold">
                                                        TIDAK DITERIMA
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {results.length > 0 && (
                        <div className="p-4 px-6 border-t border-border flex items-center justify-between bg-white">
                            <span className="text-sm text-text-muted font-medium">
                                Halaman {page} dari {totalPages} (Total {meta?.total ?? results.length} data)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => page > 1 && setPage(page - 1)}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-border text-text-main hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="px-4 py-2 rounded-lg bg-brand/5 text-brand text-sm font-bold border border-brand/10">
                                    {page}
                                </div>
                                <button
                                    onClick={() => page < totalPages && setPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="p-2 rounded-lg border border-border text-text-main hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
