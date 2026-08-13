import React, { useState, useRef } from 'react';
import { Icon } from './icons';
import { uploadToCloudinary, UploadFolder } from '../lib/uploadToCloudinary';

interface ImageUploadFieldProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: UploadFolder;
  label?: string;
  placeholder?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  folder,
  label,
  placeholder = 'Drag & drop image here, or click to browse (Max 10MB)',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const result = await uploadToCloudinary(file, folder, (percent) => {
        setProgress(percent);
      });
      onChange(result.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      {label && <label className="block font-semibold text-[var(--text-primary)]">{label}</label>}

      {value ? (
        // Preview State with Replace & Remove Actions (Prompt 13 §77-80)
        <div className="relative rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 flex items-center gap-4 shadow-sm group">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-20 h-20 object-cover rounded border border-[var(--border)] bg-black/40"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-mono text-[10px] text-[var(--accent)] truncate">{value}</p>
            <p className="text-[10px] text-[var(--text-muted)]">Image successfully uploaded to Cloudinary ({folder})</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--border)] text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Icon name="upload" size={12} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="px-2.5 py-1 rounded border border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Icon name="trash" size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Dropzone & Uploading State (Prompt 13 §74-76)
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative rounded-lg border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-[var(--accent)] bg-[var(--accent)]/10'
              : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/60'
          }`}
        >
          {isUploading ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--accent)]">
                <span className="flex items-center gap-1.5">
                  <Icon name="upload" size={14} className="animate-bounce" />
                  <span>Uploading to Cloudinary ({folder})...</span>
                </span>
                <span className="font-mono">{progress}%</span>
              </div>

              {/* Determinate --accent progress bar */}
              <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                <Icon name="upload" size={20} />
              </div>
              <p className="font-medium text-[var(--text-primary)] text-xs">{placeholder}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Supports JPG, PNG, and WebP up to 10MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {errorMsg && (
        <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-1.5">
          <Icon name="warning" size={14} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
