import { useState, useEffect, useRef } from "react";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
import { apiFetch } from "@/lib/api";
import { compressAccurately } from "image-conversion";

export default function Compressor() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'pdf' | 'image'
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);
  const [compressedBlobUrl, setCompressedBlobUrl] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [reductionPercent, setReductionPercent] = useState(null);
  const [quality, setQuality] = useState(70);
  const [targetSizeKB, setTargetSizeKB] = useState(null); // optional for images
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
      if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
    };
  }, [originalPreviewUrl, compressedBlobUrl]);

  const detectType = (selectedFile) => {
    if (!selectedFile) return null;
    const mime = (selectedFile.type || "").toLowerCase();
    const name = (selectedFile.name || "").toLowerCase();
    if (mime === "application/pdf" || name.endsWith(".pdf")) {
      return "pdf";
    }
    if (mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(name)) {
      return "image";
    }
    return null;
  };

  const handleFileProcess = (selectedFile) => {
    if (!selectedFile) return;

    const detected = detectType(selectedFile);
    if (!detected) {
      setErrorMessage("Please select a valid PDF or Image file (JPG, PNG, WebP).");
      return;
    }

    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);

    setFile(selectedFile);
    setFileType(detected);
    setOriginalSize(selectedFile.size);
    setCompressedSize(null);
    setReductionPercent(null);
    setCompressedBlobUrl(null);
    setErrorMessage("");

    if (detected === "image") {
      setOriginalPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setOriginalPreviewUrl(null);
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleFileProcess(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileProcess(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleReset = () => {
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
    setFile(null);
    setFileType(null);
    setOriginalPreviewUrl(null);
    setCompressedBlobUrl(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setReductionPercent(null);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCompress = async () => {
    if (!file) {
      setErrorMessage("Please upload a PDF or Image file first.");
      return;
    }

    setIsCompressing(true);
    setErrorMessage("");

    try {
      if (fileType === "pdf") {
        // Compress PDF via backend API
        const formData = new FormData();
        formData.append("file", file);
        formData.append("quality", quality);

        const res = await apiFetch("/compress", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          // Fallback to /compress-pdf if /compress route encountered an issue
          const fallbackRes = await apiFetch("/compress-pdf", {
            method: "POST",
            body: formData,
          });
          if (!fallbackRes.ok) {
            const errText = await fallbackRes.text();
            throw new Error(errText || `PDF compression failed with status ${fallbackRes.status}`);
          }
          const blob = await fallbackRes.blob();
          finishCompression(blob);
          return;
        }

        const blob = await res.blob();
        finishCompression(blob);
      } else {
        // Compress Image (Browser-first high-speed conversion, fallback to backend)
        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const accuracy = Math.min(0.99, Math.max(0.8, quality / 100));

        let compressedBlob;
        try {
          if (targetSizeKB && targetSizeKB > 0) {
            compressedBlob = await compressAccurately(file, {
              size: Number(targetSizeKB),
              accuracy,
              type: outputType,
            });
          } else {
            // Calculate proportional target from quality
            const targetEstimateKB = Math.max(10, Math.round((file.size / 1024) * (quality / 100)));
            compressedBlob = await compressAccurately(file, {
              size: targetEstimateKB,
              accuracy,
              type: outputType,
            });
          }
        } catch {
          // Backend fallback
          const formData = new FormData();
          formData.append("file", file);
          formData.append("targetSize", targetSizeKB || Math.round((file.size / 1024) * (quality / 100)));
          const res = await apiFetch("/compress", { method: "POST", body: formData });
          if (!res.ok) {
            throw new Error("Image compression failed");
          }
          compressedBlob = await res.blob();
        }

        finishCompression(compressedBlob);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to compress file.");
    } finally {
      setIsCompressing(false);
    }
  };

  const finishCompression = (blob) => {
    const finalSize = blob.size;
    setCompressedSize(finalSize);

    if (file && file.size > 0) {
      const reduction = Math.max(0, Math.round(((file.size - finalSize) / file.size) * 100));
      setReductionPercent(reduction);
    }

    const objectUrl = URL.createObjectURL(blob);
    setCompressedBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return "0 KB";
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getDownloadFilename = () => {
    if (!file) return "compressed-file";
    const name = file.name || "file";
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex === -1) return `${name}-compressed`;
    const base = name.substring(0, dotIndex);
    const ext = name.substring(dotIndex);
    return `${base}-compressed${ext}`;
  };

  return (
    <>
      <SEO
        title="Universal Compressor - Compress PDF & Images Online Free"
        description="Free online all-in-one file compressor. Reduce PDF document and image (JPG, PNG, WebP) file sizes without losing visual quality. Fast, private, and secure."
        keywords="compressor, compress pdf, compress image, image compressor, pdf compressor, reduce file size, optimize pdf, compress jpg, compress png, scanx compressor"
        canonical="/compress"
      />

      <div className="w-full max-w-4xl mx-auto text-gray-100 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/20 text-center">
        {/* Header */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider uppercase bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">
            All-in-One Optimization
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Universal Compressor</h1>
          <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base">
            Compress PDF documents and images (JPG, PNG, WebP) in one place with intelligent quality retention.
          </p>
        </div>

        {/* Dropzone / Upload area */}
        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
                : "border-white/30 hover:border-white/60 hover:bg-white/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="universal-file-input"
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center text-3xl">
              🗜️
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-1">
              Choose PDF or Image File
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Drag & drop your file here, or click to browse
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
              <span className="px-2 py-1 rounded bg-white/10">PDF Documents</span>
              <span className="px-2 py-1 rounded bg-white/10">JPG / JPEG</span>
              <span className="px-2 py-1 rounded bg-white/10">PNG</span>
              <span className="px-2 py-1 rounded bg-white/10">WebP</span>
            </div>
          </div>
        )}

        {/* Selected File Details & Controls */}
        {file && (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {fileType === "pdf" ? "📄" : "🖼️"}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate max-w-[220px] md:max-w-md block">
                      {file.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        fileType === "pdf"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {fileType === "pdf" ? "PDF" : "IMAGE"}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">
                    Original Size: {formatSize(originalSize)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                Change File
              </button>
            </div>

            {/* Quality Presets & Slider */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="quality-slider" className="text-sm font-semibold text-white/90">
                  Compression Level / Quality: <span className="text-blue-400 font-bold">{quality}%</span>
                </label>
                <span className="text-xs text-white/60">
                  {quality >= 80 ? "High Quality (Mild compression)" : quality >= 60 ? "Balanced (Recommended)" : "Maximum Compression"}
                </span>
              </div>

              {/* Slider */}
              <input
                id="quality-slider"
                type="range"
                min={20}
                max={95}
                value={quality}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setCompressedBlobUrl(null);
                  setCompressedSize(null);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: "Max Compression (40%)", val: 40 },
                  { label: "Recommended (70%)", val: 70 },
                  { label: "High Quality (85%)", val: 85 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      setQuality(preset.val);
                      setCompressedBlobUrl(null);
                      setCompressedSize(null);
                    }}
                    className={`text-xs px-3 py-1 rounded-full transition border ${
                      quality === preset.val
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Compress Action Button */}
            {!compressedBlobUrl && (
              <button
                type="button"
                onClick={handleCompress}
                disabled={isCompressing}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition-all text-base flex items-center justify-center gap-2"
              >
                {isCompressing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Compressing {fileType === "pdf" ? "PDF" : "Image"}...</span>
                  </>
                ) : (
                  <span>Compress {fileType === "pdf" ? "PDF" : "Image"}</span>
                )}
              </button>
            )}

            {/* Compression Results */}
            {compressedBlobUrl && (
              <div className="space-y-6 pt-2">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-white/50 block mb-1">Original Size</span>
                    <span className="text-lg font-bold text-white/90">{formatSize(originalSize)}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-white/50 block mb-1">Compressed Size</span>
                    <span className="text-lg font-bold text-emerald-400">{formatSize(compressedSize)}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs text-emerald-300 block mb-1">Reduction</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {reductionPercent !== null ? `-${reductionPercent}%` : "Optimized"}
                    </span>
                  </div>
                </div>

                {/* Previews */}
                {fileType === "image" && originalPreviewUrl && compressedBlobUrl && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-xs text-white/60 mb-2 block font-medium">Original Image</span>
                      <img
                        src={originalPreviewUrl}
                        alt="Original"
                        className="w-full h-48 object-contain rounded-lg bg-black/30"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-xs text-emerald-400 mb-2 block font-medium">Compressed Image</span>
                      <img
                        src={compressedBlobUrl}
                        alt="Compressed"
                        className="w-full h-48 object-contain rounded-lg bg-black/30"
                      />
                    </div>
                  </div>
                )}

                {/* Download and Re-compress Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={compressedBlobUrl}
                    download={getDownloadFilename()}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 text-center shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>⬇️ Download Compressed {fileType === "pdf" ? "PDF" : "Image"}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-3 px-5 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition"
                  >
                    Compress Another File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <PageInfoSection
        aboutTitle="About Universal File Compression"
        aboutText="The ScanX Universal Compressor optimizes both PDF documents and images (JPG, PNG, WebP) directly in one streamlined tool. Reduce file sizes to easily email attachments, meet strict portal upload limits, and boost website performance without degrading visual clarity."
        howItWorks={[
          "Upload your PDF document or image file.",
          "Adjust compression level to your desired balance of size and quality.",
          "Preview the reduction and download your optimized file instantly.",
        ]}
        faqs={[
          {
            question: "Can I compress both PDFs and images here?",
            answer: "Yes! The Universal Compressor auto-detects whether you uploaded a PDF or an image and applies the best optimization technique for that format.",
          },
          {
            question: "Will compression reduce visual quality?",
            answer: "ScanX uses smart compression algorithms designed to strip unnecessary metadata and optimize encoding while keeping text crisp and visuals clear.",
          },
          {
            question: "Is my data secure?",
            answer: "Yes, files are processed securely and temporary files are automatically cleaned up immediately after processing.",
          },
        ]}
      />
    </>
  );
}
