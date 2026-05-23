import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Users as UsersIcon, FileCheck, FileClock, Eye, AlertCircle, FileWarning } from 'lucide-react';
import { useParams } from 'react-router-dom';

const getStatusBadge = (status) => {
    const isApproved = status === 'TERVERIFIKASI' || status === 'Terverifikasi';
    const isRevision = status === 'REVISI' || status === 'Revisi';
    const isValidation = status === 'MENUNGGU_VALIDASI' || status === 'Menunggu Validasi';

    if (isApproved) {
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"><FileCheck size={12} /> Terverifikasi</span>;
    }
    if (isRevision) {
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100"><FileWarning size={12} /> Revisi</span>;
    }
    if (isValidation) {
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100"><FileClock size={12} /> Menunggu Validasi</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100"><FileClock size={12} /> </span>;
};

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { jurusan } = useParams();

    const fetchUsers = useCallback(async () => {
        if (!jurusan) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin') || localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/users?jurusan=${jurusan}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data users');
            }

            const data = await response.json();
            setUsers(data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [jurusan]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Calculate quick stats
    const stats = useMemo(() => {
        let total = users.length;
        let verified = users.filter(u => u.status_berkas === 'APPROVED' || u.status_berkas === 'Terverifikasi').length;
        let pending = total - verified;
        return { total, verified, pending };
    }, [users]);

    // Filter users based on search term
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const name = user.nama || '';
            const email = user.email || '';
            const noDaftar = user.no_daftar || '';
            const school = user.asal_sekolah || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                noDaftar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                school.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [users, searchTerm]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-text-main mb-1">Manage Users {jurusan?.toUpperCase()}</h1>
                    <p className="text-text-muted text-[14px]">Daftar calon pendaftaran siswa baru untuk kompetensi keahlian {jurusan?.toUpperCase()}.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">Total Pendaftar</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : `${stats.total} Siswa`}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                        <FileCheck size={24} />
                    </div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">Berkas Terverifikasi</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : `${stats.verified} Siswa`}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                        <FileClock size={24} />
                    </div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">Menunggu / Revisi</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : `${stats.pending} Siswa`}</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-bg-card p-4 px-6 rounded-[18px] mb-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 bg-bg-soft border border-border px-4 py-2.5 rounded-xl w-full md:w-[400px] focus-within:border-primary transition-all">
                    <Search size={18} className="text-text-muted" />
                    <input
                        type="text"
                        placeholder="Cari nama, email, no daftar atau asal sekolah..."
                        className="bg-transparent border-none outline-none w-full text-[14px] text-text-main placeholder:text-text-muted/40"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Area */}
            {loading ? (
                <div className="glass rounded-[20px] p-20 flex flex-col items-center justify-center border border-border">
                    <AlertCircle size={40} className="animate-spin text-brand mb-4" />
                    <p className="text-text-muted text-sm font-semibold">Memuat data pendaftar...</p>
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
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">NISN</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">Asal Sekolah</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Status Berkas</th>
                                    <th className="p-4 pr-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-12 text-center text-text-muted text-sm font-semibold">Tidak ada data pendaftar ditemukan.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr key={user.idUser} className="hover:bg-slate-50/50 transition-colors duration-150">
                                            <td className="p-4 pl-6 text-sm font-semibold text-text-main">{index + 1}</td>
                                            <td className="p-4 text-sm font-bold text-brand">{user.no_daftar}</td>
                                            <td className="p-4">
                                                <div className="text-sm font-extrabold text-text-main">{user.nama}</div>
                                                <div className="text-xs text-text-muted">{user.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                                                    {user.jurusan}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-text-main">{user.nisn}</td>
                                            <td className="p-4 text-sm font-semibold text-text-muted">{user.asal_sekolah}</td>
                                            <td className="p-4 text-center">
                                                {getStatusBadge(user.status_berkas)}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-2 cursor-pointer text-brand rounded-full hover:bg-brand/10 transition-colors inline-flex" title="Detail Siswa">
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
