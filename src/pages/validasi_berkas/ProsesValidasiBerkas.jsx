import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Send, AlertCircle, CheckCircle, FileWarning, XCircle, FileClock, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const docMap = [
    { key: 'surat_keterangan_lulus', label: 'SKL / Ijazah' },
    { key: 'raport', label: 'Rapor' },
    { key: 'ktp_ayah', label: 'KTP Ayah' },
    { key: 'ktp_ibu', label: 'KTP Ibu' },
    { key: 'kartu_keluarga', label: 'Kartu Keluarga' },
    { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
    { key: 'pas_foto', label: 'Pas Foto' },
    { key: 'sptjm', label: 'SPTJM' },
    { key: 'sk_osis', label: 'SK Pengurus OSIS' }
];

const getFileUrl = (path) => {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL.trim().replace(/\/api$/, '');
    return `${baseUrl}${path}`;
};

export default function ProsesValidasiBerkas() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loadingStudent, setLoadingStudent] = useState(true);
    const [activeDocKey, setActiveDocKey] = useState(docMap[0].key);

    // PDF State
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    // Form state: store validation status per document
    const [validationStatuses, setValidationStatuses] = useState({});
    const [validationKeterangans, setValidationKeterangans] = useState({});
    const [submitting, setSubmitting] = useState(false);

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
                    // Initialize validation statuses based on current data
                    const initialStatuses = {};
                    const initialKeterangans = {};
                    docMap.forEach(d => {
                        const docInfo = found.berkas?.[d.key];
                        if (docInfo && docInfo.id) {
                            initialStatuses[d.key] = docInfo.status || '';
                            initialKeterangans[d.key] = docInfo.keterangan || '';
                        }
                    });
                    setValidationStatuses(initialStatuses);
                    setValidationKeterangans(initialKeterangans);

                    // Set active to first available document
                    const firstAvailable = docMap.find(d => found.berkas?.[d.key]?.path);
                    if (firstAvailable) {
                        setActiveDocKey(firstAvailable.key);
                    }
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

    const activeDocument = useMemo(() => {
        if (!student || !student.berkas) return null;
        return student.berkas[activeDocKey];
    }, [student, activeDocKey]);

    const handleStatusChange = (status) => {
        setValidationStatuses(prev => ({
            ...prev,
            [activeDocKey]: status
        }));
    };

    const handleKeteranganChange = (e) => {
        setValidationKeterangans(prev => ({
            ...prev,
            [activeDocKey]: e.target.value
        }));
    };

    const handleSaveSingle = async () => {
        if (!activeDocument || !activeDocument.id) return;
        const currentStatus = validationStatuses[activeDocKey];
        if (!currentStatus) {
            alert('Pilih status validasi terlebih dahulu!');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const payloadDoc = {
                document_id: activeDocument.id,
                status: currentStatus
            };
            if (currentStatus === 'REVISI' || currentStatus === 'REJECTED') {
                payloadDoc.keterangan = validationKeterangans[activeDocKey] || '';
            }

            const payload = {
                documents: [payloadDoc]
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/validations/students/${id}/documents`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Status dokumen berhasil disimpan.');
                // Update local state to reflect changes
                setStudent(prev => ({
                    ...prev,
                    berkas: {
                        ...prev.berkas,
                        [activeDocKey]: {
                            ...prev.berkas[activeDocKey],
                            status: currentStatus
                        }
                    }
                }));
            } else {
                const res = await response.json();
                alert(res.message || 'Gagal menyimpan status dokumen.');
            }
        } catch (error) {
            console.error('Error updating validation:', error);
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveAll = async () => {
        // Collect all documents that have an id and a changed/selected status
        const documentsToUpdate = [];
        docMap.forEach(d => {
            const docInfo = student?.berkas?.[d.key];
            if (docInfo && docInfo.id && validationStatuses[d.key]) {
                const currentStatus = validationStatuses[d.key];
                const docPayload = {
                    document_id: docInfo.id,
                    status: currentStatus
                };
                if (currentStatus === 'REVISI' || currentStatus === 'REJECTED') {
                    docPayload.keterangan = validationKeterangans[d.key] || '';
                }
                documentsToUpdate.push(docPayload);
            }
        });

        if (documentsToUpdate.length === 0) {
            alert('Tidak ada dokumen untuk divalidasi.');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('tokenAdmin');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/validations/students/${id}/documents`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ documents: documentsToUpdate })
            });

            if (response.ok) {
                alert('Semua status dokumen berhasil disimpan.');
                fetchStudentData(); // Refresh to ensure sync
            } else {
                const res = await response.json();
                alert(res.message || 'Gagal menyimpan status.');
            }
        } catch (error) {
            console.error('Error updating all validations:', error);
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setSubmitting(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    if (loadingStudent) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
                <p className="text-text-muted font-semibold">Memuat data pendaftar...</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <h2 className="text-xl font-bold text-text-main mb-2">Pendaftar Tidak Ditemukan</h2>
                <button onClick={() => navigate('/validasi-berkas')} className="px-4 py-2 bg-brand text-white rounded-xl font-semibold">Kembali</button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-main transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-[24px] font-extrabold text-text-main mb-0.5 flex items-center gap-2">
                        Proses Validasi Berkas
                    </h1>
                    <p className="text-text-muted text-[13px]">
                        Verifikasi dokumen atas nama <span className="font-bold text-brand">{student.nama}</span> ({student.no_daftar})
                    </p>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Left Pane - Document Viewer */}
                <div className="flex-1 flex flex-col bg-bg-card rounded-[24px] border border-border overflow-hidden shadow-sm">
                    {/* Document Selector Tabs */}
                    <div className="px-4 py-3 border-b border-border bg-slate-50 flex overflow-x-auto gap-2 no-scrollbar">
                        {docMap.map(d => {
                            const hasDoc = student.berkas?.[d.key]?.path;
                            const isActive = activeDocKey === d.key;
                            return (
                                <button
                                    key={d.key}
                                    onClick={() => setActiveDocKey(d.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2
                                        ${isActive
                                            ? 'bg-brand text-white shadow-md'
                                            : hasDoc
                                                ? 'bg-white border border-border text-text-main hover:bg-slate-100'
                                                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    {d.label}
                                    {hasDoc && (
                                        <span className={`w-2 h-2 rounded-full ${validationStatuses[d.key] === 'APPROVED' ? 'bg-emerald-400' :
                                            validationStatuses[d.key] === 'REVISI' ? 'bg-amber-400' :
                                                validationStatuses[d.key] === 'REJECTED' ? 'bg-rose-400' : 'bg-slate-300'
                                            }`}></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Viewer Area */}
                    <div className="flex-1 p-4 bg-slate-100/60 overflow-hidden relative flex flex-col">
                        {activeDocument?.path ? (
                            <div className="flex-1 bg-white border border-border rounded-xl shadow-lg p-2 relative flex flex-col overflow-auto items-center justify-start">
                                <Document
                                    file={getFileUrl(activeDocument.path)}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={<div className="p-10 text-brand font-semibold flex items-center gap-2"><Loader2 className="animate-spin" /> Memuat PDF...</div>}
                                    error={<div className="p-10 text-rose-500 font-semibold flex items-center gap-2"><AlertCircle /> Gagal memuat file PDF. Mungkin format file bukan PDF atau URL tidak valid.</div>}
                                    className="flex flex-col items-center w-full"
                                >
                                    <Page 
                                        pageNumber={pageNumber} 
                                        width={1000} // Render large for clarity, CSS will scale it down
                                        renderTextLayer={false} 
                                        renderAnnotationLayer={false} 
                                        className="[&>canvas]:!w-auto [&>canvas]:!max-w-full [&>canvas]:!h-auto [&>canvas]:!max-h-[calc(100vh-280px)] [&>canvas]:object-contain shadow-sm border border-slate-200"
                                    />
                                </Document>
                                {numPages > 1 && (
                                    <div className="sticky bottom-4 mt-4 flex items-center gap-4 bg-white/90 backdrop-blur px-5 py-2.5 rounded-full shadow-lg border border-border">
                                        <button 
                                            disabled={pageNumber <= 1} 
                                            onClick={() => setPageNumber(p => p - 1)}
                                            className="p-1 px-3 rounded hover:bg-slate-100 disabled:opacity-50 font-bold transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-sm font-semibold text-text-main">
                                            {pageNumber} / {numPages}
                                        </span>
                                        <button 
                                            disabled={pageNumber >= numPages} 
                                            onClick={() => setPageNumber(p => p + 1)}
                                            className="p-1 px-3 rounded hover:bg-slate-100 disabled:opacity-50 font-bold transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-text-muted p-10">
                                <FileClock size={48} className="mx-auto text-slate-300 mb-3" />
                                <h4 className="text-sm font-bold text-text-main mb-1">Dokumen Tidak Tersedia</h4>
                                <p className="text-xs max-w-xs mx-auto">
                                    Calon siswa ini belum mengunggah {docMap.find(d => d.key === activeDocKey)?.label}.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane - Form Input */}
                <div className="w-[400px] flex flex-col bg-bg-card rounded-[24px] border border-border overflow-y-auto shadow-sm p-6">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 border-b border-border pb-2">Status Validasi Dokumen</h3>

                    <div className="mb-6">
                        <p className="text-sm font-bold text-text-main mb-1">{docMap.find(d => d.key === activeDocKey)?.label}</p>
                        {activeDocument ? (
                            <p className="text-xs text-text-muted break-all bg-slate-50 p-2 rounded border border-border">{activeDocument.keterangan || 'Tidak ada catatan tambahan dari siswa.'}</p>
                        ) : (
                            <p className="text-xs text-amber-500 font-semibold bg-amber-50 p-2 rounded border border-amber-100">Belum diunggah</p>
                        )}
                    </div>

                    <div className="space-y-3 flex-1">
                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${validationStatuses[activeDocKey] === 'APPROVED' ? 'border-emerald-500 bg-emerald-50/50' : 'border-border hover:border-emerald-200 hover:bg-slate-50'}`}>
                            <input
                                type="radio"
                                name="status"
                                value="APPROVED"
                                checked={validationStatuses[activeDocKey] === 'APPROVED'}
                                onChange={() => handleStatusChange('APPROVED')}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                disabled={!activeDocument?.id}
                            />
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-emerald-700 flex items-center gap-2"><CheckCircle size={16} /> APPROVED</span>
                                <span className="block text-xs text-emerald-600/70 mt-0.5">Dokumen lengkap dan valid.</span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${validationStatuses[activeDocKey] === 'REVISI' ? 'border-amber-500 bg-amber-50/50' : 'border-border hover:border-amber-200 hover:bg-slate-50'}`}>
                            <input
                                type="radio"
                                name="status"
                                value="REVISI"
                                checked={validationStatuses[activeDocKey] === 'REVISI'}
                                onChange={() => handleStatusChange('REVISI')}
                                className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                                disabled={!activeDocument?.id}
                            />
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-amber-700 flex items-center gap-2"><FileWarning size={16} /> REVISI</span>
                                <span className="block text-xs text-amber-600/70 mt-0.5">Dokumen salah, kurang jelas, atau keliru.</span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${validationStatuses[activeDocKey] === 'REJECTED' ? 'border-rose-500 bg-rose-50/50' : 'border-border hover:border-rose-200 hover:bg-slate-50'}`}>
                            <input
                                type="radio"
                                name="status"
                                value="REJECTED"
                                checked={validationStatuses[activeDocKey] === 'REJECTED'}
                                onChange={() => handleStatusChange('REJECTED')}
                                className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                                disabled={!activeDocument?.id}
                            />
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-rose-700 flex items-center gap-2"><XCircle size={16} /> REJECTED</span>
                                <span className="block text-xs text-rose-600/70 mt-0.5">Dokumen palsu atau tidak dapat diterima.</span>
                            </div>
                        </label>

                        {(validationStatuses[activeDocKey] === 'REVISI' || validationStatuses[activeDocKey] === 'REJECTED') && (
                            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in slide-in-from-top-2 fade-in duration-200">
                                <label className="block text-sm font-bold text-text-main mb-2">Keterangan / Alasan {validationStatuses[activeDocKey] === 'REVISI' ? 'Revisi' : 'Penolakan'}</label>
                                <textarea 
                                    className="w-full bg-white border border-border rounded-lg p-3 text-sm text-text-main outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none h-24"
                                    placeholder={`Tuliskan alasan mengapa dokumen ini ${validationStatuses[activeDocKey] === 'REVISI' ? 'perlu direvisi' : 'ditolak'}...`}
                                    value={validationKeterangans[activeDocKey] || ''}
                                    onChange={handleKeteranganChange}
                                ></textarea>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
                        <button
                            onClick={handleSaveSingle}
                            disabled={submitting || !activeDocument?.id}
                            className="w-full py-3 px-4 bg-brand text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand/90 transition-all shadow-sm shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Simpan Dokumen Ini
                        </button>

                        <button
                            onClick={handleSaveAll}
                            disabled={submitting}
                            className="w-full py-3 px-4 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Simpan Semua Perubahan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
