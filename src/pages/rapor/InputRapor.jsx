import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Send, AlertCircle, Loader2 } from 'lucide-react';

const getFileUrl = (path) => {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL.trim().replace(/\/api$/, '');
    return `${baseUrl}${path}`;
};

export default function InputRapor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loadingStudent, setLoadingStudent] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [sem1, setSem1] = useState('');
    const [sem2, setSem2] = useState('');
    const [sem3, setSem3] = useState('');
    const [sem4, setSem4] = useState('');
    const [sem5, setSem5] = useState('');
    const [prestasi, setPrestasi] = useState('');

    const fetchStudentData = useCallback(async () => {
        setLoadingStudent(true);
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
            if (response.ok) {
                const resData = await response.json();
                const found = resData.data?.find(s => s.id === Number(id));
                if (found) {
                    setStudent(found);
                } else {
                    console.error('Student not found');
                }
            }
        } catch (error) {
            console.error('Error fetching student info:', error);
        } finally {
            setLoadingStudent(false);
        }
    }, [id]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/rapor-scores`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    id_student: Number(id),
                    semester_1: Number(sem1),
                    semester_2: Number(sem2),
                    semester_3: Number(sem3),
                    semester_4: Number(sem4),
                    semester_5: Number(sem5),
                    prestasi: prestasi ? Number(prestasi) : null
                })
            });

            if (response.ok) {
                navigate('/rapor-score?status=belum');
            } else {
                const res = await response.json();
                alert(res.message || 'Gagal menyimpan nilai rapor');
            }
        } catch (error) {
            console.error('Error posting score:', error);
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 bg-bg-card hover:bg-slate-100 text-text-muted hover:text-text-main rounded-xl border border-border transition-all cursor-pointer flex items-center justify-center"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-[24px] font-extrabold text-text-main">Input Nilai Rapor Siswa</h1>
                    <p className="text-text-muted text-[13px]">Masukkan nilai semester 1-5 berdasarkan berkas rapor siswa yang diunggah.</p>
                </div>
            </div>

            {loadingStudent ? (
                <div className="glass rounded-[20px] flex-1 flex flex-col items-center justify-center border border-border">
                    <Loader2 size={40} className="animate-spin text-brand mb-4" />
                    <p className="text-text-muted text-sm font-semibold">Memuat berkas rapor siswa...</p>
                </div>
            ) : !student ? (
                <div className="glass rounded-[20px] flex-1 flex flex-col items-center justify-center border border-border p-6 text-center">
                    <AlertCircle size={48} className="text-rose-500 mb-4" />
                    <p className="text-text-main text-base font-bold">Data Calon Siswa Tidak Ditemukan</p>
                    <p className="text-text-muted text-sm max-w-sm mt-1">
                        Siswa dengan ID {id} tidak ada dalam daftar pendaftaran atau berkas pendaftaran belum lengkap.
                    </p>
                    <button
                        onClick={() => navigate('/rapor-score?status=belum')}
                        className="mt-6 px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-hover transition-all cursor-pointer"
                    >
                        Kembali Ke Daftar
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                    {/* Left Pane - PDF Preview */}
                    <div className="flex-1 flex flex-col bg-bg-card rounded-[24px] border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border bg-slate-50/50 flex justify-between items-center">
                            <span className="text-xs font-extrabold text-text-main uppercase tracking-wider flex items-center gap-2">
                                <FileText size={16} className="text-brand" />
                                Lampiran Rapor Siswa
                            </span>
                            <a
                                href={getFileUrl(student.berkas?.raport?.path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-brand hover:underline font-bold"
                            >
                                Buka di Tab Baru
                            </a>
                        </div>
                        <div className="flex-1 p-4 bg-slate-100/60 flex items-center justify-center overflow-hidden">
                            {student.berkas?.raport?.path ? (
                                <iframe
                                    src={getFileUrl(student.berkas.raport.path)}
                                    className="w-full h-full rounded-xl border border-border/80 bg-white shadow-inner"
                                    title="PDF Rapor Siswa"
                                />
                            ) : (
                                <div className="text-center text-text-muted p-10">
                                    <AlertCircle size={48} className="mx-auto text-amber-500 mb-3" />
                                    <h4 className="text-sm font-bold text-text-main mb-1">Pratinjau Rapor Tidak Tersedia</h4>
                                    <p className="text-xs max-w-xs mx-auto">
                                        Calon siswa ini belum mengunggah dokumen bukti nilai rapor di portal pendaftaran.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Pane - Form Input */}
                    <div className="w-[450px] flex flex-col bg-bg-card rounded-[24px] border border-border overflow-y-auto shadow-sm p-6">
                        {/* Student Summary */}
                        <div className="bg-bg-soft border border-border/60 p-4 rounded-2xl mb-6">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Profil Pendaftar</h3>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-text-main">
                                <div>
                                    <span className="text-text-muted block text-[10px] font-bold uppercase">Nama Siswa</span>
                                    <span className="font-extrabold text-brand truncate block">{student.nama}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[10px] font-bold uppercase">No Daftar</span>
                                    <span className="font-bold">{student.no_daftar}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[10px] font-bold uppercase">Jurusan Pilihan</span>
                                    <span className="font-bold text-brand">{student.jurusan}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[10px] font-bold uppercase">Asal Sekolah</span>
                                    <span className="font-semibold truncate block">{student.asal_sekolah} (Akred: {student.akreditasi_sekolah || '-'})</span>
                                </div>
                            </div>
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Formulir Input Nilai Rapor</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-text-main">Semester 1 <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                        placeholder="0 - 100"
                                        value={sem1}
                                        onChange={(e) => setSem1(e.target.value)}
                                        className="w-full p-3 bg-bg-soft border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-text-main font-semibold"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-text-main">Semester 2 <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                        placeholder="0 - 100"
                                        value={sem2}
                                        onChange={(e) => setSem2(e.target.value)}
                                        className="w-full p-3 bg-bg-soft border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-text-main font-semibold"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-text-main">Semester 3 <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                        placeholder="0 - 100"
                                        value={sem3}
                                        onChange={(e) => setSem3(e.target.value)}
                                        className="w-full p-3 bg-bg-soft border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-text-main font-semibold"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-text-main">Semester 4 <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                        placeholder="0 - 100"
                                        value={sem4}
                                        onChange={(e) => setSem4(e.target.value)}
                                        className="w-full p-3 bg-bg-soft border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-text-main font-semibold"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-text-main">Semester 5 <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        required
                                        placeholder="0 - 100"
                                        value={sem5}
                                        onChange={(e) => setSem5(e.target.value)}
                                        className="w-full p-3 bg-bg-soft border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-text-main font-semibold"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-text-main flex items-center gap-1">
                                        Nilai Prestasi
                                        <span className="text-[10px] font-normal text-text-muted">(Opsional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Kosongkan jika tidak ada"
                                        value={prestasi}
                                        onChange={(e) => setPrestasi(e.target.value)}
                                        className="w-full p-3 bg-bg-soft border border-border rounded-xl text-xs outline-none focus:border-primary transition-all text-text-main font-semibold font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-border/80">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2.5 bg-white border border-border text-text-main text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-brand/10 cursor-pointer flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            Simpan Nilai
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
