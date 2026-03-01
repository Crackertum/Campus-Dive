import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';
import { Upload, FileText, Trash2, Eye, CloudUpload, X, File } from 'lucide-react';

export default function DocumentsPage() {
    const { user } = useAuth();
    const toast = useToast();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [docName, setDocName] = useState('');
    const fileInputRef = useRef(null);

    const loadDocs = useCallback(async () => {
        try {
            const res = await api.get('/student/documents');
            setDocuments(res.data);
        } catch (e) { } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadDocs(); }, [loadDocs]);

    const handleUpload = async (files) => {
        if (!files?.length) return;
        setUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('document', file);
                formData.append('document_name', docName || file.name);
                await api.upload('/student/documents', formData);
            }
            toast.success('Document uploaded!');
            setDocName('');
            loadDocs();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/student/documents/${deleteId}`);
            toast.success('Document deleted');
            setDeleteId(null);
            loadDocs();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        handleUpload(e.dataTransfer.files);
    };

    if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold">Documents</h1>

            {/* Upload Zone */}
            <div
                className={`card p-8 border-2 border-dashed transition-all duration-200 cursor-pointer text-center
          ${dragActive ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'}
        `}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => handleUpload(e.target.files)}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <CloudUpload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary-500' : 'text-surface-400'}`} />
                <p className="text-lg font-medium mb-1">
                    {uploading ? 'Uploading...' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-surface-500">or click to browse • PDF, DOC, DOCX, JPG, PNG • Max 5MB</p>

                {/* Document Name Input */}
                <div className="max-w-sm mx-auto mt-4" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={docName}
                        onChange={e => setDocName(e.target.value)}
                        className="input-field text-center text-sm"
                        placeholder="Document name (optional)"
                    />
                </div>
            </div>

            {/* Document List */}
            {documents.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No documents yet"
                    description="Upload your first document to get started. We accept resumes, transcripts, and other recruitment documents."
                    action={<button onClick={() => fileInputRef.current?.click()} className="btn-primary"><Upload className="w-4 h-4" /> Upload Document</button>}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map(doc => (
                        <div key={doc.id} className="card-hover p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                                    <File className="w-6 h-6 text-surface-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{doc.document_name || doc.original_name}</p>
                                    <p className="text-xs text-surface-500 mt-0.5">
                                        {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2">
                                        <StatusBadge status={doc.status || 'pending'} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 pt-3 border-t border-surface-100 dark:border-surface-800">
                                <a href={`/uploads/${doc.filename}`} target="_blank" rel="noopener" className="btn-ghost text-xs flex-1 justify-center">
                                    <Eye className="w-3.5 h-3.5" /> View
                                </a>
                                <button onClick={() => setDeleteId(doc.id)} className="btn-ghost text-xs flex-1 justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Document"
                message="This document will be permanently deleted. This action cannot be undone."
                confirmText="Delete"
                danger
            />
        </div>
    );
}
