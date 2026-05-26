import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, AlertCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export default function NilaiUjian() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState('AK');

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status') || 'belum';
    const isScored = status === 'sudah';

    const limit = 10;

    const majors = [
        { id: 'AK', name: 'Akuntansi (AK)' },
        { id: 'ATP', name: 'Agribisnis Tanaman Perkebunan (ATP)' },
        { id: 'DKV', name: 'Desain Komunikasi Visual (DKV)' },
        { id: 'TKJ', name: 'Teknik Komputer Jaringan (TKJ)' },
        { id: 'TKR', name: 'Teknik Kendaraan Ringan (TKR)' },
    ];

    // Reset page to 1 when major or status changes
    useEffect(() => {
        setPage(1);
    }, [selectedMajor, status]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const url = `${import.meta.env.VITE_API_URL}/nilai-scores/status?isScored=${isScored}&major=${selectedMajor}&limit=${limit}&page=${page}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data nilai ujian');
            }

            const result = await response.json();
            setData(result.data || []);
            setMeta(result.meta || null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    }, [isScored, selectedMajor, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalData = meta?.total || 0;
    const totalPages = Math.ceil(totalData / limit);

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages || data.length === limit) setPage(page + 1);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-text-main mb-1">
                        Nilai Ujian - {isScored ? 'Sudah Diinput' : 'Belum Diinput'}
                    </h1>
                    <p className="text-text-muted text-[14px]">
                        Daftar nilai ujian calon siswa baru berdasarkan status input.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-bg-card p-4 px-6 rounded-[18px] mb-6 shadow-sm border border-border flex items-center justify-between">
                <div className="flex items-center gap-4 w-full max-w-md">
                    <label className="text-sm font-semibold text-text-main whitespace-nowrap">Jurusan:</label>
                    <select
                        value={selectedMajor}
                        onChange={(e) => setSelectedMajor(e.target.value)}
                        className="bg-bg-soft border border-border px-4 py-2.5 rounded-xl w-full text-sm text-text-main outline-none focus:border-brand transition-all cursor-pointer"
                    >
                        {majors.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Area */}
            {loading ? (
                <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-border">
                    <AlertCircle size={40} className="animate-spin text-brand mb-4" />
                    <p className="text-text-muted text-sm font-semibold">Memuat data nilai ujian...</p>
                </div>
            ) : (
                <div className="glass rounded-[20px] overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse cursor-default">
                            <thead className="bg-slate-50 border-b border-border">
                                <tr>
                                    <th className="p-4 pl-6 font-semibold text-text-muted text-xs uppercase tracking-wider">No</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">No Daftar</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">Nama</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">Jurusan</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Matematika</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">B. Indonesia</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">B. Inggris</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Agama</th>
                                    <th className="p-4 pr-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Rata-rata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="p-12 text-center text-text-muted text-sm font-semibold">Tidak ada data nilai ujian ditemukan.</td>
                                    </tr>
                                ) : (
                                    data.map((student, index) => {
                                        const score = student.nilaiScore || {};
                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                                <td className="p-4 pl-6 text-sm font-semibold text-text-main">
                                                    {(page - 1) * limit + index + 1}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-brand">{student.no_daftar}</td>
                                                <td className="p-4">
                                                    <div className="text-sm font-extrabold text-text-main">{student.nama}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                                                        {student.jurusan}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.math_score != null ? score.math_score : '-'}
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.indonesia_score != null ? score.indonesia_score : '-'}
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.english_score != null ? score.english_score : '-'}
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.religion_score != null ? score.religion_score : '-'}
                                                </td>
                                                <td className="p-4 pr-6 text-sm font-bold text-brand text-center bg-slate-50/30">
                                                    {isScored && score.average_score != null ? score.average_score : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data.length > 0 && (
                        <div className="p-4 px-6 border-t border-border flex items-center justify-between bg-white">
                            <span className="text-sm text-text-muted font-medium">
                                Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, totalData || page * limit)} dari {totalData || 'banyak'} data
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-border text-text-main hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    title="Sebelumnya"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="px-4 py-2 rounded-lg bg-brand/5 text-brand text-sm font-bold border border-brand/10">
                                    {page}
                                </div>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page >= totalPages && totalPages > 0}
                                    className="p-2 rounded-lg border border-border text-text-main hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    title="Selanjutnya"
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
