import { useRef, useState } from "react";
import { UploadSimple, FileArrowUp, Image as ImageIcon, Files, Camera } from "@phosphor-icons/react";

/**
 * UnifiedDropzone Component
 * Consistent, clean, and distraction-free file dropzone for all ScanX tools.
 * Styled in ScanX's emerald green & dark slate theme.
 */
export default function UnifiedDropzone({
  onFileSelect,
  accept,
  multiple = false,
  title = "Choose File",
  subtitle = "Drag & drop or click to browse",
  iconType = "upload", // "upload" | "file" | "image" | "files"
  className = "",
  id = "unified-dropzone-input",
  showCamera = false,
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const shouldShowCamera = showCamera || (
    Boolean(accept && accept.includes("image")) && (
      title.toLowerCase().includes("take photo") || 
      title.toLowerCase().includes("photo")
    )
  );

  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    if (typeof onFileSelect === "function") {
      if (multiple) {
        onFileSelect(Array.from(fileList));
      } else {
        onFileSelect(fileList[0]);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const renderIcon = () => {
    switch (iconType) {
      case "image":
        return <ImageIcon size={28} weight="duotone" className="text-emerald-400" />;
      case "files":
      case "pdf":
        return <Files size={28} weight="duotone" className="text-emerald-400" />;
      case "file":
        return <FileArrowUp size={28} weight="duotone" className="text-emerald-400" />;
      case "upload":
      default:
        return <UploadSimple size={28} weight="duotone" className="text-emerald-400" />;
    }
  };

  return (
    <label
      htmlFor={id}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none block ${
        isDragOver
          ? "border-emerald-400 bg-emerald-500/20 scale-[1.01] shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/40"
          : "border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 bg-emerald-950/10"
      } ${className}`}
    >
      {/* Standard file picker input */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Direct camera capture input for mobile devices */}
      {shouldShowCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          id={`${id}-camera`}
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      )}

      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 transition-all duration-300 shadow-inner pointer-events-none">
        {renderIcon()}
      </div>

      <div className="text-base sm:text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors pointer-events-none">
        {title}
      </div>

      {subtitle && (
        <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-sm pointer-events-none">
          {subtitle}
        </p>
      )}

      {/* Direct mobile camera action button */}
      {shouldShowCamera && (
        <div className="mt-3.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/35 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Camera size={16} weight="duotone" className="text-emerald-400" />
            <span>Take Photo with Camera</span>
          </button>
        </div>
      )}
    </label>
  );
}
