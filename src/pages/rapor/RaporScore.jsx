import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Trophy, GraduationCap, Percent, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function RaporScore() {
    const [scores, setScores] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const location = useLocation();
    const navigate = useNavigate();
    const statusParam = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('status') || 'sudah';
    }, [location.search]);

    const fetchRaporScores = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json',
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/rapor-scores`, {
                method: 'GET',
                headers
            });
            if (!response.ok) throw new Error('Gagal mengambil data rapor');
            const resData = await response.json();
            const fetchedScores = resData.success && Array.isArray(resData.data) ? resData.data : [];
            setScores(fetchedScores);

            const berkasResponse = await fetch(`${import.meta.env.VITE_API_URL}/berkas/all-berkas`, {
                method: 'GET',
                headers
            });
            if (berkasResponse.ok) {
                const berkasData = await berkasResponse.json();
                setAllStudents(berkasData.data || []);
            }
        } catch (error) {
            console.error('Error fetching rapor scores:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRaporScores();
    }, [fetchRaporScores]);

    // Compute the list of scores to display based on statusParam
    const displayedScores = useMemo(() => {
        if (statusParam === 'belum') {
            const scoredStudentIds = new Set(scores.map(s => s.id_student));
            const unprovidedStudents = allStudents.filter(student => !scoredStudentIds.has(student.id));

            return unprovidedStudents.map(student => ({
                id: `belum-${student.id}`,
                id_student: student.id,
                semester_1: '-',
                semester_2: '-',
                semester_3: '-',
                semester_4: '-',
                semester_5: '-',
                prestasi: '-',
                rata_rata: '-',
                nilai_akhir: '-',
                student: {
                    nama: student.nama,
                    asal_sekolah: student.asal_sekolah,
                    akreditasi_sekolah: student.akreditasi_sekolah,
                    jurusan: student.jurusan
                }
            }));
        }
        return scores;
    }, [statusParam, scores, allStudents]);

    // Calculate quick stats
    const stats = useMemo(() => {
        const totalSudah = scores.length;
        const totalSiswa = allStudents.length;
        const totalBelum = Math.max(0, totalSiswa - totalSudah);
        const progressPercent = totalSiswa > 0 ? ((totalSudah / totalSiswa) * 100).toFixed(0) : 0;

        if (statusParam === 'belum') {
            return {
                title1: 'Total Belum Input',
                value1: `${totalBelum} Siswa`,
                title2: 'Target Total Siswa',
                value2: `${totalSiswa} Siswa`,
                title3: 'Persentase Progres',
                value3: `${progressPercent}%`,
                icon3: <Percent size={24} />
            };
        } else {
            const sumFinal = scores.reduce((acc, curr) => acc + (curr.nilai_akhir || 0), 0);
            const average = totalSudah > 0 ? (sumFinal / totalSudah).toFixed(1) : 0;
            const highest = totalSudah > 0 ? Math.max(...scores.map(s => s.nilai_akhir || 0)).toFixed(1) : 0;

            return {
                title1: 'Total Rapor Sudah Input',
                value1: `${totalSudah} Siswa`,
                title2: 'Rerata Nilai Akhir',
                value2: average,
                title3: 'Nilai Akhir Tertinggi',
                value3: highest,
                icon3: <Trophy size={24} />
            };
        }
    }, [scores, allStudents, statusParam]);

    // Filter scores based on search term
    const filteredScores = useMemo(() => {
        return displayedScores.filter(s => {
            const studentName = s.student?.nama || '';
            const schoolName = s.student?.asal_sekolah || '';
            return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schoolName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [displayedScores, searchTerm]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-text-main mb-1">
                        Nilai Rapor Calon Siswa ({statusParam === 'belum' ? 'Belum Diinput' : 'Sudah Diinput'})
                    </h1>
                    <p className="text-text-muted text-[14px]">Daftar nilai rapor semester 1-5 beserta nilai akhir calon siswa baru.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">{stats.title1}</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : stats.value1}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                        <Percent size={24} />
                    </div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">{stats.title2}</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : stats.value2}</span>
                    </div>
                </div>
                <div className="bg-bg-card p-6 rounded-[20px] shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                        {stats.icon3}
                    </div>
                    <div>
                        <span className="text-[14px] text-text-muted font-medium block">{stats.title3}</span>
                        <span className="text-[24px] font-extrabold text-text-main">{loading ? '...' : stats.value3}</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-bg-card p-4 px-6 rounded-[18px] mb-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 bg-bg-soft border border-border px-4 py-2.5 rounded-xl w-full md:w-[400px] focus-within:border-primary transition-all">
                    <Search size={18} className="text-text-muted" />
                    <input
                        type="text"
                        placeholder="Cari nama atau asal sekolah..."
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
                    <p className="text-text-muted text-sm font-semibold">Memuat data nilai rapor...</p>
                </div>
            ) : (
                <div className="glass rounded-[20px] overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse cursor-default">
                            <thead className="bg-slate-50 border-b border-border">
                                <tr>
                                    <th className="p-4 pl-6 font-semibold text-text-muted text-xs uppercase tracking-wider">No</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">Nama Siswa</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">Jurusan</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider">Asal Sekolah</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Sem 1</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Sem 2</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Sem 3</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Sem 4</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Sem 5</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Prestasi</th>
                                    <th className="p-4 font-semibold text-text-muted text-xs uppercase tracking-wider text-center">Rerata</th>
                                    <th className="p-4 pr-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Nilai Akhir</th>
                                    <th className="p-4 pr-6 font-semibold text-text-muted text-xs uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredScores.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="p-12 text-center text-text-muted text-sm font-semibold">Tidak ada data nilai rapor ditemukan.</td>
                                    </tr>
                                ) : (
                                    filteredScores.map((s, index) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                            <td className="p-4 pl-6 text-sm font-semibold text-text-main">{index + 1}</td>
                                            <td className="p-4">
                                                <div className="text-sm font-extrabold text-text-main">{s.student?.nama || '-'}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                                                    {s.student?.jurusan || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-text-muted">{s.student?.asal_sekolah || '-'}</td>
                                            <td className="p-4 text-sm text-center text-text-main">{s.semester_1}</td>
                                            <td className="p-4 text-sm text-center text-text-main">{s.semester_2}</td>
                                            <td className="p-4 text-sm text-center text-text-main">{s.semester_3}</td>
                                            <td className="p-4 text-sm text-center text-text-main">{s.semester_4}</td>
                                            <td className="p-4 text-sm text-center text-text-main">{s.semester_5}</td>
                                            <td className="p-4 text-sm text-center text-text-main">{s.prestasi === '-' ? '-' : (s.prestasi || 0)}</td>
                                            <td className="p-4 text-sm font-bold text-center text-amber-600">{s.rata_rata}</td>
                                            <td className="p-4 pr-6 text-sm font-black text-right text-emerald-600">{s.nilai_akhir}</td>
                                            <td className='p-4 pr-6 text-sm text-right text-emerald-600'>
                                                <button 
                                                    onClick={() => navigate(`/rapor-score/input/${s.id_student}`)}
                                                    className='p-2 text-sm bg-blue-500 hover:bg-blue-600 rounded-lg text-white cursor-pointer transition-colors'
                                                >
                                                    Input
                                                </button>
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