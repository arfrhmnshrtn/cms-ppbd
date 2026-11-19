import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Download,
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    X,
    RefreshCw,
    Users,
    Clock,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function NilaiUjian() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [stats, setStats] = useState({ total: 0, sudah: 0, belum: 0 });
    const [selectedMajor, setSelectedMajor] = useState('AK');

    // Excel Import & Template States
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [uploadingPreview, setUploadingPreview] = useState(false);
    const [confirmingImport, setConfirmingImport] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [activePreviewTab, setActivePreviewTab] = useState('valid');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const fileInputRef = useRef(null);

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

    const selectedMajorName =
        majors.find((m) => m.id === selectedMajor)?.name || selectedMajor;

    // Reset page to 1 when major or status changes
    useEffect(() => {
        setPage(1);
    }, [selectedMajor, status]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const headers = {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            };

            const url = `${import.meta.env.VITE_API_URL}/nilai-scores/status?isScored=${isScored}&major=${selectedMajor}&limit=${limit}&page=${page}`;
            const otherUrl = `${import.meta.env.VITE_API_URL}/nilai-scores/status?isScored=${!isScored}&major=${selectedMajor}&limit=1&page=1`;

            const [response, otherResponse] = await Promise.all([
                fetch(url, { method: 'GET', headers }),
                fetch(otherUrl, { method: 'GET', headers }).catch(() => null),
            ]);

            if (!response.ok) {
                throw new Error('Gagal mengambil data nilai ujian');
            }

            const result = await response.json();
            const otherResult =
                otherResponse && otherResponse.ok
                    ? await otherResponse.json().catch(() => null)
                    : null;

            const currentCount = result.meta?.total ?? (result.data?.length || 0);
            const otherCount = otherResult?.meta?.total ?? (otherResult?.data?.length || 0);

            const sudahCount = isScored ? currentCount : otherCount;
            const belumCount = isScored ? otherCount : currentCount;

            setData(result.data || []);
            setMeta(result.meta || null);
            setStats({
                total: sudahCount + belumCount,
                sudah: sudahCount,
                belum: belumCount,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setMeta(null);
            setStats({ total: 0, sudah: 0, belum: 0 });
        } finally {
            setLoading(false);
        }
    }, [isScored, selectedMajor, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 1. Download Template Excel Per Jurusan
    const handleDownloadTemplate = async () => {
        setDownloadingTemplate(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const url = `${import.meta.env.VITE_API_URL}/nilai-scores/excel/template?major=${selectedMajor}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            if (!response.ok) {
                let errMessage = 'Gagal mengunduh template Excel';
                try {
                    const errJson = await response.json();
                    errMessage = errJson.message || errMessage;
                } catch {
                    // ignore parse error
                }
                throw new Error(errMessage);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute(
                'download',
                `Template_Nilai_Ujian_PPDB_${selectedMajor}.xlsx`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            Swal.fire({
                icon: 'success',
                title: 'Template Berhasil Diunduh',
                text: `Template Excel nilai ujian untuk jurusan ${selectedMajorName} berhasil diunduh.`,
                timer: 2200,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengunduh Template',
                text: error.message || 'Terjadi kesalahan saat mengunduh template Excel.',
            });
        } finally {
            setDownloadingTemplate(false);
        }
    };

    // 2. Upload & Preview Excel Per Jurusan
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset input agar file yang sama bisa dipilih ulang jika diperlukan
        event.target.value = '';

        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            Swal.fire({
                icon: 'warning',
                title: 'Format File Tidak Sesuai',
                text: 'Harap pilih file Excel dengan format ekstensi .xlsx',
            });
            return;
        }

        setUploadingPreview(true);
        setUploadedFileName(file.name);

        try {
            const token = localStorage.getItem('tokenAdmin');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('major', selectedMajor);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/nilai-scores/excel/preview?major=${selectedMajor}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                    body: formData,
                },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Gagal memvalidasi file Excel yang diunggah',
                );
            }

            const preview = result.data;
            setPreviewData(preview);
            setActivePreviewTab(
                preview.valid_data?.length > 0 ? 'valid' : 'invalid',
            );
            setPreviewModalOpen(true);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Excel Gagal',
                text:
                    error.message ||
                    'Pastikan file Excel menggunakan template resmi dan tidak kosong.',
            });
        } finally {
            setUploadingPreview(false);
        }
    };

    // 3. Konfirmasi Import Nilai Ujian ke Database
    const handleConfirmImport = async () => {
        if (!previewData || !previewData.valid_data?.length) return;

        const validCount = previewData.valid_data.length;
        const invalidCount = previewData.invalid_data?.length || 0;

        const confirmResult = await Swal.fire({
            title: 'Konfirmasi Import Nilai Ujian',
            html: `
                <div style="text-align:left;font-size:14px;line-height:1.6;">
                    <p>Anda akan menyimpan nilai ujian untuk jurusan <b>${selectedMajorName}</b>:</p>
                    <ul style="margin-top:8px;padding-left:18px;">
                        <li>Data Valid yang akan disimpan: <b>${validCount} siswa</b></li>
                        <li>Nilai Baru: <b>${previewData.summary?.new_scores_count || 0} siswa</b></li>
                        <li>Pembaruan Nilai: <b>${previewData.summary?.updated_scores_count || 0} siswa</b></li>
                        ${
                            invalidCount > 0
                                ? `<li style="color:#dc2626;">Data Tidak Valid (diabaikan): <b>${invalidCount} baris</b></li>`
                                : ''
                        }
                    </ul>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Simpan Nilai',
            cancelButtonText: 'Batal',
        });

        if (!confirmResult.isConfirmed) return;

        setConfirmingImport(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/nilai-scores/excel/confirm?major=${selectedMajor}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        major: selectedMajor,
                        items: previewData.valid_data,
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Gagal menyimpan data nilai ujian ke database',
                );
            }

            const importSummary = result.data;
            setPreviewModalOpen(false);
            setPreviewData(null);

            await Swal.fire({
                icon: 'success',
                title: 'Import Nilai Berhasil!',
                html: `
                    <div style="font-size:14px;line-height:1.6;">
                        <p>Berhasil menyimpan <b>${importSummary.total_imported}</b> data nilai ujian jurusan <b>${selectedMajor}</b>.</p>
                        <p style="margin-top:4px;color:#475569;">
                            Nilai Baru: <b>${importSummary.created_count}</b> | Diperbarui: <b>${importSummary.updated_count}</b>
                        </p>
                    </div>
                `,
                confirmButtonColor: '#2563eb',
            });

            fetchData();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan Nilai',
                text:
                    error.message ||
                    'Terjadi kesalahan saat menyimpan data nilai ujian.',
            });
        } finally {
            setConfirmingImport(false);
        }
    };

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
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-text-main mb-1">
                        Nilai Ujian - {isScored ? 'Sudah Diinput' : 'Belum Diinput'}
                    </h1>
                    <p className="text-text-muted text-[14px]">
                        Daftar dan import nilai ujian calon siswa per jurusan menggunakan Excel (.xlsx).
                    </p>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-brand p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="text-white flex items-center justify-center flex-shrink-0">
                        <Users size={56} />
                    </div>
                    <div>
                        <span className="text-[14px] text-white font-medium block">
                            Jumlah Siswa ({selectedMajor})
                        </span>
                        <span className="text-[24px] font-extrabold text-white">
                            {loading ? '...' : `${stats.total} Siswa`}
                        </span>
                    </div>
                </div>

                <div className="bg-emerald-600 p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="text-white flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={50} />
                    </div>
                    <div>
                        <span className="text-[14px] text-white font-medium block">
                            Sudah Diinput
                        </span>
                        <span className="text-[24px] font-extrabold text-white">
                            {loading ? '...' : `${stats.sudah} Siswa`}
                        </span>
                    </div>
                </div>

                <div className="bg-amber-600 p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="text-white flex items-center justify-center flex-shrink-0">
                        <Clock size={50} />
                    </div>
                    <div>
                        <span className="text-[14px] text-white font-medium block">
                            Belum Diinput
                        </span>
                        <span className="text-[24px] font-extrabold text-white">
                            {loading ? '...' : `${stats.belum} Siswa`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter & Excel Action Bar */}
            <div className="bg-bg-card p-4 px-6 mb-6 shadow-sm border border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full max-w-md">
                    <label className="text-sm font-semibold text-text-main whitespace-nowrap">
                        Jurusan:
                    </label>
                    <select
                        value={selectedMajor}
                        onChange={(e) => setSelectedMajor(e.target.value)}
                        className="bg-bg-soft border border-border px-4 py-2.5 w-full text-sm text-text-main outline-none focus:border-brand transition-all cursor-pointer"
                    >
                        {majors.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tombol Download Template & Upload Excel per Jurusan */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        disabled={downloadingTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {downloadingTemplate ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Download size={16} />
                        )}
                        <span>
                            {downloadingTemplate
                                ? 'Mengunduh...'
                                : `Download Template (${selectedMajor})`}
                        </span>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPreview}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {uploadingPreview ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Upload size={16} />
                        )}
                        <span>
                            {uploadingPreview
                                ? 'Memvalidasi File...'
                                : `Upload Excel (${selectedMajor})`}
                        </span>
                    </button>
                </div>
            </div>

            {/* Table Area */}
            {loading ? (
                <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-border">
                    <AlertCircle size={40} className="animate-spin text-brand mb-4" />
                    <p className="text-text-muted text-sm font-semibold">
                        Memuat data nilai ujian...
                    </p>
                </div>
            ) : (
                <div className="glass overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse cursor-default">
                            <thead className="bg-slate-50 border-b border-border">
                                <tr>
                                    <th className="p-4 pl-6 font-semibold text-text-muted text-xs uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">
                                        No Daftar
                                    </th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">
                                        Jurusan
                                    </th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">
                                        Matematika
                                    </th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">
                                        B. Indonesia
                                    </th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">
                                        B. Inggris
                                    </th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">
                                        Agama
                                    </th>
                                    <th className="p-4 pr-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">
                                        Rata-rata
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="p-12 text-center text-text-muted text-sm font-semibold"
                                        >
                                            Tidak ada data nilai ujian ditemukan untuk jurusan{' '}
                                            {selectedMajor}.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((student, index) => {
                                        const score = student.nilaiScore || {};
                                        return (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-slate-50/50 transition-colors duration-150"
                                            >
                                                <td className="p-4 pl-6 text-sm font-semibold text-text-main">
                                                    {(page - 1) * limit + index + 1}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-brand">
                                                    {student.no_daftar}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-extrabold text-text-main">
                                                        {student.nama}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                                                        {student.jurusan}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.math_score != null
                                                        ? score.math_score
                                                        : '-'}
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.indonesia_score != null
                                                        ? score.indonesia_score
                                                        : '-'}
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.english_score != null
                                                        ? score.english_score
                                                        : '-'}
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-main text-center">
                                                    {isScored && score.religion_score != null
                                                        ? score.religion_score
                                                        : '-'}
                                                </td>
                                                <td className="p-4 pr-6 text-sm font-bold text-brand text-center bg-slate-50/30">
                                                    {isScored && score.average_score != null
                                                        ? score.average_score
                                                        : '-'}
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
                                Menampilkan {(page - 1) * limit + 1} -{' '}
                                {Math.min(page * limit, totalData || page * limit)} dari{' '}
                                {totalData || 'banyak'} data
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

            {/* Modal Preview Import Excel Sebelum Disimpan */}
            {previewModalOpen && previewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-5 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <FileSpreadsheet size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-800">
                                        Preview Import Nilai Ujian — Jurusan {selectedMajorName}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        File: <span className="font-semibold">{uploadedFileName}</span> | Periksa data di bawah sebelum melakukan konfirmasi penyimpanan.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!confirmingImport) {
                                        setPreviewModalOpen(false);
                                        setPreviewData(null);
                                    }
                                }}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Ringkasan / Summary Cards */}
                        <div className="p-5 px-6 bg-white border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                <span className="text-xs font-semibold text-slate-500 block">
                                    Total Baris Diperiksa
                                </span>
                                <span className="text-xl font-extrabold text-slate-800">
                                    {previewData.summary?.total_rows_checked || 0}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                <span className="text-xs font-semibold text-emerald-700 block">
                                    Data Valid (Siap Simpan)
                                </span>
                                <span className="text-xl font-extrabold text-emerald-700">
                                    {previewData.summary?.valid_count || 0} Siswa
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
                                <span className="text-xs font-semibold text-red-700 block">
                                    Data Tidak Valid (Error)
                                </span>
                                <span className="text-xl font-extrabold text-red-700">
                                    {previewData.summary?.invalid_count || 0} Baris
                                </span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                                <span className="text-xs font-semibold text-blue-700 block">
                                    Baru / Diperbarui
                                </span>
                                <span className="text-sm font-extrabold text-blue-700 mt-1 block">
                                    {previewData.summary?.new_scores_count || 0} Baru •{' '}
                                    {previewData.summary?.updated_scores_count || 0} Update
                                </span>
                            </div>
                        </div>

                        {/* Tabs Data Valid vs Data Tidak Valid */}
                        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('valid')}
                                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                                    activePreviewTab === 'valid'
                                        ? 'border-emerald-600 text-emerald-700 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <CheckCircle2 size={15} />
                                <span>
                                    Data Valid ({previewData.valid_data?.length || 0})
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActivePreviewTab('invalid')}
                                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                                    activePreviewTab === 'invalid'
                                        ? 'border-red-600 text-red-700 bg-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <XCircle size={15} />
                                <span>
                                    Data Tidak Valid ({previewData.invalid_data?.length || 0})
                                </span>
                            </button>
                        </div>

                        {/* Preview Table Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {activePreviewTab === 'valid' ? (
                                previewData.valid_data?.length === 0 ? (
                                    <div className="p-10 text-center text-slate-500 text-sm font-semibold">
                                        Tidak ada baris data yang valid. Silakan periksa tab Data Tidak Valid.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead className="bg-slate-100 text-slate-600 uppercase">
                                                <tr>
                                                    <th className="p-3">Baris</th>
                                                    <th className="p-3">Kode PPDB</th>
                                                    <th className="p-3">Nama Siswa</th>
                                                    <th className="p-3 text-center">Jurusan</th>
                                                    <th className="p-3 text-center">MTK</th>
                                                    <th className="p-3 text-center">B. Indo</th>
                                                    <th className="p-3 text-center">B. Ing</th>
                                                    <th className="p-3 text-center">Agama</th>
                                                    <th className="p-3 text-center">Rata-rata</th>
                                                    <th className="p-3 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {previewData.valid_data.map((item) => (
                                                    <tr
                                                        key={item.no_daftar}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <td className="p-3 font-mono text-slate-500">
                                                            #{item.row_number}
                                                        </td>
                                                        <td className="p-3 font-bold text-blue-600">
                                                            {item.no_daftar}
                                                        </td>
                                                        <td className="p-3 font-semibold text-slate-800">
                                                            {item.nama}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                                                                {item.jurusan}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center font-semibold">
                                                            {item.math_score}
                                                        </td>
                                                        <td className="p-3 text-center font-semibold">
                                                            {item.indonesia_score}
                                                        </td>
                                                        <td className="p-3 text-center font-semibold">
                                                            {item.english_score}
                                                        </td>
                                                        <td className="p-3 text-center font-semibold">
                                                            {item.religion_score}
                                                        </td>
                                                        <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/40">
                                                            {item.average_score}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {item.is_update ? (
                                                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[11px]">
                                                                    Update
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                                                                    Baru
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : previewData.invalid_data?.length === 0 ? (
                                <div className="p-10 text-center text-emerald-600 text-sm font-semibold">
                                    Seluruh baris pada file Excel valid dan tidak ditemukan kesalahan!
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-red-200 rounded-xl">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="bg-red-50 text-red-800 uppercase">
                                            <tr>
                                                <th className="p-3">Baris Excel</th>
                                                <th className="p-3">Kode PPDB</th>
                                                <th className="p-3">Nama Siswa</th>
                                                <th className="p-3">Keterangan Kesalahan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-red-100">
                                            {previewData.invalid_data.map((errItem, idx) => (
                                                <tr
                                                    key={`${errItem.row_number}-${idx}`}
                                                    className="hover:bg-red-50/40"
                                                >
                                                    <td className="p-3 font-mono font-bold text-red-600">
                                                        Baris {errItem.row_number}
                                                    </td>
                                                    <td className="p-3 font-semibold text-slate-700">
                                                        {errItem.no_daftar || '-'}
                                                    </td>
                                                    <td className="p-3 font-semibold text-slate-700">
                                                        {errItem.nama || '-'}
                                                    </td>
                                                    <td className="p-3 text-red-600 font-medium">
                                                        <ul className="list-disc pl-4 space-y-0.5">
                                                            {(errItem.errors || [errItem.message]).map(
                                                                (msg, i) => (
                                                                    <li key={i}>{msg}</li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Hanya data yang berstatus <b>Valid</b> yang akan disimpan ke database.
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={confirmingImport}
                                    onClick={() => {
                                        setPreviewModalOpen(false);
                                        setPreviewData(null);
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    disabled={
                                        confirmingImport ||
                                        !previewData.valid_data ||
                                        previewData.valid_data.length === 0
                                    }
                                    onClick={handleConfirmImport}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {confirmingImport ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={16} />
                                    )}
                                    <span>
                                        {confirmingImport
                                            ? 'Menyimpan ke Database...'
                                            : `Konfirmasi Import (${previewData.valid_data?.length || 0} Siswa)`}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
