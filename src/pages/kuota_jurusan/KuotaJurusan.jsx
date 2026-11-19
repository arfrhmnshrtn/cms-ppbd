import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Save,
    RefreshCw,
    CheckCircle2,
    Edit3,
    GraduationCap,
    AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';

const getJurusanBadgeClass = (jurusan) => {
    switch ((jurusan || '').toUpperCase()) {
        case 'AK':
            return 'bg-yellow-300 text-yellow-700 border border-yellow-200';
        case 'ATP':
            return 'bg-green-100 text-green-700 border border-green-200';
        case 'DKV':
            return 'bg-gray-200 text-gray-700 border border-gray-300';
        case 'TKJ':
            return 'bg-blue-100 text-blue-700 border border-blue-200';
        case 'TKR':
            return 'bg-red-100 text-red-700 border border-red-200';
        default:
            return 'bg-brand/10 text-brand';
    }
};

export default function KuotaJurusan() {
    const [quotas, setQuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedJurusan, setSelectedJurusan] = useState('');
    const [quotaInput, setQuotaInput] = useState('');

    const fetchQuotas = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/announcements/quotas`,
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
                throw new Error('Gagal mengambil data kuota jurusan');
            }

            const result = await response.json();
            const list = result.data || [];
            setQuotas(list);

            if (list.length > 0) {
                setSelectedJurusan((prev) => {
                    const active = prev || list[0].jurusan;
                    const found = list.find((item) => item.jurusan === active);
                    if (found) {
                        setQuotaInput(String(found.quota));
                    }
                    return active;
                });
            }
        } catch (error) {
            console.error('Error fetching quotas:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
                text:
                    error.message ||
                    'Terjadi kesalahan saat mengambil daftar jurusan dan kuota.',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuotas();
    }, [fetchQuotas]);

    const handleSelectJurusan = (jurusanCode) => {
        setSelectedJurusan(jurusanCode);
        const found = quotas.find((item) => item.jurusan === jurusanCode);
        if (found) {
            setQuotaInput(String(found.quota));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedJurusan) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Jurusan',
                text: 'Silakan pilih jurusan terlebih dahulu dari dropdown.',
            });
            return;
        }

        const parsedQuota = Number(quotaInput);
        if (
            quotaInput === '' ||
            Number.isNaN(parsedQuota) ||
            !Number.isInteger(parsedQuota) ||
            parsedQuota < 0
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Kuota Tidak Valid',
                text: 'Masukkan jumlah kuota berupa angka bulat (minimal 0).',
            });
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/announcements/quotas`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        jurusan: selectedJurusan,
                        quota: parsedQuota,
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || 'Gagal menyimpan kuota jurusan',
                );
            }

            await Swal.fire({
                icon: 'success',
                title: 'Kuota Berhasil Disimpan',
                text: result.message,
                timer: 2000,
                showConfirmButton: false,
            });

            fetchQuotas();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan Kuota',
                text:
                    error.message ||
                    'Terjadi kesalahan saat menyimpan kuota jurusan.',
            });
        } finally {
            setSaving(false);
        }
    };

    const totalQuotaAll = quotas.reduce(
        (acc, curr) => acc + (Number(curr.quota) || 0),
        0,
    );
    const totalPendaftarAll = quotas.reduce(
        (acc, curr) => acc + (Number(curr.total_pendaftar) || 0),
        0,
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-text-main mb-1">
                        Pengaturan Kuota Jurusan
                    </h1>
                    <p className="text-text-muted text-[14px]">
                        Atur jumlah daya tampung (kuota kelulusan) untuk masing-masing jurusan PPDB.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Input Kuota Jurusan */}
                <div className="lg:col-span-5">
                    <div className="bg-bg-card p-6 shadow-sm border border-border">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-brand/10 text-brand flex items-center justify-center">
                                <GraduationCap size={22} />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-text-main">
                                    Input Kuota Jurusan
                                </h2>
                                <p className="text-xs text-text-muted">
                                    Pilih jurusan dari daftar database lalu masukkan jumlah kuota.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    Pilih Jurusan
                                </label>
                                <select
                                    value={selectedJurusan}
                                    onChange={(e) =>
                                        handleSelectJurusan(e.target.value)
                                    }
                                    disabled={loading || quotas.length === 0}
                                    className="bg-bg-soft border border-border px-4 py-3 w-full text-sm font-semibold text-text-main outline-none focus:border-brand transition-all cursor-pointer"
                                >
                                    {quotas.map((item) => (
                                        <option
                                            key={item.jurusan}
                                            value={item.jurusan}
                                        >
                                            {item.nama_jurusan}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">
                                    Jumlah Kuota Jurusan
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Masukkan jumlah kuota (contoh: 80)"
                                    value={quotaInput}
                                    onChange={(e) =>
                                        setQuotaInput(e.target.value)
                                    }
                                    disabled={loading}
                                    className="bg-bg-soft border border-border px-4 py-3 w-full text-sm font-semibold text-text-main outline-none focus:border-brand transition-all"
                                    required
                                />
                                <p className="text-xs text-text-muted mt-1.5">
                                    Jumlah siswa maksimal yang dinyatakan lulus pada jurusan{' '}
                                    <span className="font-bold text-brand">
                                        {selectedJurusan || '-'}
                                    </span>
                                    .
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={saving || loading}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {saving ? (
                                    <RefreshCw
                                        size={18}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Save size={18} />
                                )}
                                <span>
                                    {saving
                                        ? 'Menyimpan...'
                                        : 'Simpan Kuota Jurusan'}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tabel Daftar Kuota Jurusan */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Ringkasan Total */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-card p-5 border border-border shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-text-muted uppercase">
                                    Total Daya Tampung
                                </span>
                                <p className="text-2xl font-extrabold text-brand mt-1">
                                    {totalQuotaAll} Siswa
                                </p>
                            </div>
                            <div className="w-11 h-11 bg-brand/10 text-brand flex items-center justify-center">
                                <GraduationCap size={22} />
                            </div>
                        </div>

                        <div className="bg-bg-card p-5 border border-border shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-text-muted uppercase">
                                    Total Pendaftar Saat Ini
                                </span>
                                <p className="text-2xl font-extrabold text-text-main mt-1">
                                    {totalPendaftarAll} Siswa
                                </p>
                            </div>
                            <div className="w-11 h-11 bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Users size={22} />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="glass p-16 flex flex-col items-center justify-center border border-border">
                            <AlertCircle
                                size={36}
                                className="animate-spin text-brand mb-3"
                            />
                            <p className="text-text-muted text-sm font-semibold">
                                Memuat data kuota jurusan...
                            </p>
                        </div>
                    ) : (
                        <div className="glass overflow-hidden border border-border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-border">
                                        <tr>
                                            <th className="p-4 pl-6 font-semibold text-text-muted text-xs uppercase tracking-wider">
                                                Kode
                                            </th>
                                            <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">
                                                Nama Jurusan
                                            </th>
                                            <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">
                                                Kuota
                                            </th>
                                            <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">
                                                Pendaftar
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {quotas.map((item) => {
                                            const isSelected =
                                                item.jurusan === selectedJurusan;
                                            return (
                                                <tr
                                                    key={item.jurusan}
                                                    className={`transition-colors ${isSelected
                                                        ? 'bg-blue-50/60'
                                                        : 'hover:bg-slate-50/60'
                                                        }`}
                                                >
                                                    <td className="p-4 pl-6">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 text-xs font-extrabold ${getJurusanBadgeClass(item.jurusan)}`}
                                                        >
                                                            {item.jurusan}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm font-bold text-text-main">
                                                            {item.nama_jurusan}
                                                        </div>
                                                        <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                                                            {item.is_configured ? (
                                                                <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                                                                    <CheckCircle2
                                                                        size={12}
                                                                    />
                                                                    Tersimpan
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    Default Sistem
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-base font-extrabold text-green-600">
                                                            {item.quota}
                                                        </span>
                                                        <span className="text-xs text-text-muted ml-1">
                                                            siswa
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center text-sm font-semibold text-text-main">
                                                        {item.total_pendaftar} siswa
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}