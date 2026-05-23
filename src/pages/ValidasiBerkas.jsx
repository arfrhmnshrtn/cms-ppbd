import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, FileClock, FileWarning, FileCheck, AlertCircle } from 'lucide-react';

const trackMap = {
    surat_keterangan_lulus: "SKL",
    raport: "Rpr",
    ktp_ayah: "KTP.A",
    ktp_ibu: "KTP.I",
    kartu_keluarga: "KK",
    akta_kelahiran: "Akta",
    pas_foto: "Foto",
    sptjm: "SPTJM",
    sk_osis: "OSIS"
};

const getOverallStatus = (berkas) => {
    console.log(berkas)
    if (!berkas || Object.keys(berkas).length === 0) return 'Pending';
    const statuses = Object.values(berkas).map(b => b.status);
    if (statuses.some(s => s === 'REVISI')) return 'REVISI';
    if (statuses.every(s => s === 'APPROVED')) return 'Terverifikasi';
    return 'Pending';
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Terverifikasi':
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"><FileCheck size={12} /> Terverifikasi</span>;
        case 'REVISI':
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100"><FileWarning size={12} /> Revisi</span>;
        default:
            return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100"><FileClock size={12} /> Pending</span>;
    }
};

const getFileUrl = (path) => {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL.trim().replace(/\/api$/, '');
    return `${baseUrl}${path}`;
};

export default function ValidasiBerkas() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');

    const fetchAllBerkas = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/berkas/all-berkas`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'application/json',
                }
            });
            const resData = await response.json();
            console.log(resData);
            setApplicants(resData.data || []);
        } catch (error) {
            console.error('Error fetching berkas:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllBerkas();
    }, [fetchAllBerkas]);

    const stats = useMemo(() => {
        let pending = 0, revision = 0, verified = 0;
        applicants.forEach(a => {
            const status = getOverallStatus(a.berkas);
            if (status === 'Verified') verified++;
            else if (status === 'Revision') revision++;
            else pending++;
        });
        return { pending, revision, verified };
    }, [applicants]);

    const filteredApplicants = useMemo(() => {
        return applicants.filter(a => {
            const matchesSearch = (a.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.no_daftar || '').toLowerCase().includes(searchTerm.toLowerCase());
            const overallStatus = getOverallStatus(a.berkas);
            let matchesStatus = true;
            if (statusFilter === 'Verified') matchesStatus = (overallStatus === 'Verified');
            else if (statusFilter === 'Pending') matchesStatus = (overallStatus === 'Pending');
            else if (statusFilter === 'Revision') matchesStatus = (overallStatus === 'Revision');
            return matchesSearch && matchesStatus;
        });
    }, [applicants, searchTerm, statusFilter]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-text-main mb-1">Verifikasi Berkas Calon Siswa</h1>
                    <p className="text-text-muted text-[14px]">Daftar kelengkapan dokumen pendaftaran calon siswa baru.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0"><FileClock size={24} /></div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">Menunggu Antrean</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : `${stats.pending} Siswa`}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0"><FileWarning size={24} /></div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">Perlu Revisi</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : `${stats.revision} Siswa`}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0"><FileCheck size={24} /></div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">Terverifikasi</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : `${stats.verified} Siswa`}</span>
                    </div>
                </div>
            </div>

            <div className="bg-bg-card p-4 px-6 rounded-[18px] mb-6 shadow-sm flex flex-col md:flex-row justify-between gap-4 md:items-center border border-border">
                <div className="flex items-center gap-3 bg-bg-soft border border-border px-4 py-2.5 rounded-xl w-full md:w-[400px] focus-within:border-primary transition-all">
                    <Search size={18} className="text-text-muted" />
                    <input type="text" placeholder="Cari nama atau nomor daftar..." className="bg-transparent border-none outline-none w-full text-[14px] text-text-main placeholder:text-text-muted/40" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <select className="px-4 py-2.5 bg-bg-soft border border-border rounded-xl text-[14px] text-text-main outline-none cursor-pointer hover:border-primary transition-all font-bold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="Semua Status">Semua Status</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending">Pending</option>
                        <option value="Revision">Revision</option>
                    </select>
                    <button className="p-2.5 bg-bg-soft border border-border rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all"><Filter size={18} /></button>
                </div>
            </div>

            {loading ? (
                <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-border">
                    <AlertCircle size={40} className="animate-spin text-brand mb-4" />
                    <p className="text-text-muted text-sm font-semibold">Memuat berkas calon siswa...</p>
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
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">Asal Sekolah</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Berkas</th>
                                    <th className="p-4 pr-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Status</th>
                                    <th className="p-4 pr-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredApplicants.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-text-muted text-sm font-semibold">Tidak ada data calon siswa ditemukan.</td>
                                    </tr>
                                ) : (
                                    filteredApplicants.map((a, index) => {
                                        const overallStatus = getOverallStatus(a.berkas);
                                        return (
                                            <tr key={a.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                                <td className="p-4 pl-6 text-sm font-semibold text-text-main">{index + 1}</td>
                                                <td className="p-4 text-sm font-bold text-brand">{a.no_daftar}</td>
                                                <td className="p-4">
                                                    <div className="text-sm font-extrabold text-text-main">{a.nama}</div>
                                                    <div className="text-xs text-text-muted">{a.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand">{a.jurusan}</span>
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-text-muted">{a.asal_sekolah}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {Object.keys(trackMap).map(docKey => {
                                                            const doc = a.berkas?.[docKey];
                                                            const initials = trackMap[docKey];
                                                            if (!doc) {
                                                                return (
                                                                    <span key={docKey} title={`${initials}: Belum diunggah`} className="w-8 h-8 rounded-full border border-slate-200 border-dashed bg-slate-50 text-slate-400 text-[10px] font-extrabold flex items-center justify-center opacity-50 cursor-not-allowed select-none">
                                                                        {initials}
                                                                    </span>
                                                                );
                                                            }
                                                            const isApproved = doc.status === 'APPROVED';
                                                            const isRejected = doc.status === 'REVISI';
                                                            const statusColor = isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : isRejected ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse";
                                                            return (
                                                                <span key={docKey} title={`${doc.keterangan}`} className={`w-8 h-8 rounded-full border text-[10px] font-extrabold flex items-center justify-center transition-all duration-150 ${statusColor} hover:scale-110 shadow-sm`}>
                                                                    {initials}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="p-4 pr-6 text-right">{getStatusBadge(overallStatus)}</td>
                                                <td className="p-4 text-right">
                                                    <button className="px-3 py-1 bg-brand text-white text-sm rounded transition-colors inline-flex">Periksa</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}