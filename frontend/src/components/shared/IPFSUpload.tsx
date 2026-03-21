// src/components/IPFSUpload.tsx
'use client';
import { useState, useCallback } from 'react';
import { useAppStore }           from '@/store/appStore';

interface UploadResult {
  cid:  string;
  url:  string;
  size: number;
}

interface Props {
  onUpload:    (result: UploadResult) => void;
  label?:      string;
  accept?:     string;
  maxSizeMB?:  number;
}

export function IPFSUpload({
  onUpload,
  label      = 'Upload deliverable to IPFS',
  accept     = '*/*',
  maxSizeMB  = 50,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState<string | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const addToast = useAppStore(s => s.addToast);

  const handleFile = useCallback(async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress('Pinning to IPFS...');
    addToast({ type: 'pending', title: 'Uploading to IPFS', message: file.name });

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Using the backend proxy route
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ipfs/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Upload failed');
      }

      const data: UploadResult = await res.json();
      setProgress(`Pinned: ${data.cid.slice(0, 20)}...`);
      addToast({
        type:    'success',
        title:   'Pinned to IPFS',
        message: `CID: ${data.cid.slice(0, 16)}...`,
      });
      onUpload(data);

    } catch (err: any) {
      setError(err.message);
      addToast({ type: 'error', title: 'Upload failed', message: err.message });
    } finally {
      setUploading(false);
    }
  }, [onUpload, maxSizeMB, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className={`ipfs-drop-zone ${uploading ? 'ipfs-drop-zone--uploading' : ''}`}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      style={{
        border:        '1px dashed var(--border)',
        borderRadius:  '16px',
        padding:       '32px',
        textAlign:     'center',
        cursor:        uploading ? 'wait' : 'pointer',
        background:    'var(--bg-secondary)',
        transition:    'all 0.2s ease',
      }}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
        id="ipfs-file-input"
        disabled={uploading}
      />
      <label htmlFor="ipfs-file-input" style={{ cursor: 'pointer', display: 'block' }}>
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl animate-bounce">📦</span>
            <span className="font-mono text-sm text-[var(--primary)] uppercase tracking-widest">
              {progress}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">📄</div>
            <div className="flex flex-col gap-1">
               <p className="text-[var(--text-primary)] font-bold">
                 {label}
               </p>
               <p className="text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                 Drag & drop or click · Max {maxSizeMB}MB · Pinned via Pinata
               </p>
            </div>
          </div>
        )}
      </label>
      {error && (
        <p className="text-[var(--crimson)] font-mono text-[10px] mt-4 uppercase">
           ERROR: {error}
        </p>
      )}
    </div>
  );
}
