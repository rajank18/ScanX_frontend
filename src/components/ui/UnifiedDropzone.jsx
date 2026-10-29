import { useRef, useState } from "react";
import { UploadSimple, FileArrowUp, Image as ImageIcon, Files } from "@phosphor-icons/react";

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
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none block ${
        isDragOver
          ? "border-emerald-400 bg-emerald-500/15 scale-[1.01]"
          : "border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 bg-emerald-950/10"
      } ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 transition-all duration-300 shadow-inner">
        {renderIcon()}
      </div>

      <div className="text-base sm:text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
        {title}
      </div>

      {subtitle && (
        <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-sm">
          {subtitle}
        </p>
      )}
    </label>
  );
}
