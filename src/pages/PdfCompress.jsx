import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";
import { apiFetch } from "@/lib/api";

export default function PdfCompress() {
  const [file, setFile] = useState(null);
  const [compressedBlobUrl, setCompressedBlobUrl] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [reductionPercent, setReductionPercent] = useState(null);
  const [quality, setQuality] = useState(70);

  useEffect(() => {
    return () => {
      if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
    };
  }, [compressedBlobUrl]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCompressedBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setOriginalSize(null);
      setCompressedSize(null);
      setReductionPercent(null);
      setErrorMessage("");
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("quality", quality);
    try {
      setIsCompressing(true);
      setErrorMessage("");
      setOriginalSize(file.size);

      const res = await apiFetch("/compress-pdf", { 
        method: "POST", 
        body: formData 
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }

      const blob = await res.blob();
      const compressedFileSize = blob.size;
      setCompressedSize(compressedFileSize);

      const reduction = file.size > 0 
        ? Math.max(0, Math.round(((file.size - compressedFileSize) / file.size) * 100))
        : 0;
      setReductionPercent(reduction);

      const objectUrl = URL.createObjectURL(blob);
      setCompressedBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to compress PDF");
    } finally {
      setIsCompressing(false);
    }
  };

  const formatSize = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <>
      <SEO 
        title="Free PDF Compressor - Reduce PDF File Size Online"
        description="Compress PDF files online for free. Reduce PDF file size without losing quality. Fast, secure, and no registration required."
        keywords="pdf compressor, compress pdf, reduce pdf size, pdf optimization, online pdf compression, scanx compress"
        canonical="/pdf-compress"
      />
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">PDF Compression</h2>
        <p className="text-white/60 mb-6 text-sm">Upload a PDF file to compress it and reduce its file size.</p>

        <UnifiedDropzone
          onFileSelect={(f) => handleFileSelect({ target: { files: [f] } })}
          accept=".pdf,application/pdf"
          title="Choose PDF File"
          subtitle="Select a PDF file to compress and reduce file size"
          iconType="file"
          className="mb-6"
        />

        {file && (
          <div className="mb-6 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg inline-block">
            <p className="text-xs font-semibold text-emerald-300">Selected: {file.name}</p>
            <p className="text-xs text-white/50 mt-0.5">Size: {formatSize(file.size)}</p>
          </div>
        )}

        {file && (
          <div className="flex flex-col gap-4 items-center mt-2 mb-6">
            <label className="w-full max-w-sm text-left text-sm font-medium">
              Quality: <span className="font-semibold text-emerald-400">{quality}%</span>
              <input 
                type="range" 
                min={10} 
                max={100} 
                value={quality} 
                onChange={e => setQuality(Number(e.target.value))} 
                className="w-full accent-emerald-500 mt-2" 
              />
            </label>
          </div>
        )}

        {errorMessage && (
          <div className="text-red-400 mb-6 p-3 bg-red-400/10 rounded-lg text-sm border border-red-500/20">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleCompress}
          disabled={!file || isCompressing}
          className="w-full py-3 px-6 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold mb-4 transition shadow-lg text-sm sm:text-base"
        >
          {isCompressing ? "Compressing..." : "Compress PDF"}
        </button>

        {compressedBlobUrl && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left">
              <p className="text-sm text-white/70">
                Original: <span className="font-semibold text-white">{formatSize(originalSize)}</span>
              </p>
              <p className="text-sm text-white/70 mt-1">
                Compressed: <span className="font-semibold text-white">{formatSize(compressedSize)}</span>
              </p>
              <p className="text-sm text-emerald-400 mt-1 font-semibold">
                Reduction: {reductionPercent}%
              </p>
            </div>
            <a
              href={compressedBlobUrl}
              download="compressed.pdf"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition font-semibold shadow-md inline-block w-full text-sm sm:text-base text-center"
            >
              Download Compressed PDF
            </a>
          </div>
        )}

        {!file && <p className="mt-4 text-white/70">Upload a PDF file to get started.</p>}
      </div>
      <PageInfoSection
        aboutTitle="About PDF Compression"
        aboutText="PDF Compression reduces document size for faster sharing, uploads, and storage while trying to preserve readability. It is useful for email attachments, web uploads, and reducing archive space usage."
        howItWorks={[
          "Upload your PDF file from your device.",
          "Adjust quality level based on your preferred size and clarity.",
          "Compress and download the optimized PDF.",
        ]}
        faqs={[
          {
            question: "Will compression reduce PDF quality?",
            answer: "Higher compression can reduce quality. Use the quality slider to balance size and visual clarity.",
          },
          {
            question: "Can I see file size reduction?",
            answer: "Yes, the page shows original size, compressed size, and percentage reduction.",
          },
          {
            question: "Is this useful for email attachments?",
            answer: "Yes, compressed PDFs are easier to send and upload to forms or portals.",
          },
        ]}
      />
    </>
  );
}




