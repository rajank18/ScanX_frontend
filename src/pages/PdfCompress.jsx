import { useState } from "react";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
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

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCompressedBlobUrl(null);
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

      const reduction = Math.round(((file.size - compressedFileSize) / file.size) * 100);
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
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">PDF Compression</h2>
        <p className="text-white/70 mb-6">Upload a PDF file to compress it and reduce its file size.</p>

        <label className="block w-full mb-4 p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
          <span className="text-white/80">Choose PDF File</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        {file && (
          <div className="mb-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm text-white/70">Selected: <span className="font-semibold">{file.name}</span></p>
            <p className="text-xs text-white/50 mt-1">Size: {formatSize(file.size)}</p>
          </div>
        )}

        {file && (
          <div className="flex flex-col gap-4 items-center mt-4 mb-4">
            <label className="w-full max-w-sm text-left">
              Quality: <span className="font-semibold">{quality}%</span>
              <input 
                type="range" 
                min={10} 
                max={100} 
                value={quality} 
                onChange={e => setQuality(Number(e.target.value))} 
                className="w-full" 
              />
            </label>
          </div>
        )}

        {errorMessage && (
          <div className="text-red-400 mb-4 p-3 bg-red-400/10 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleCompress}
          disabled={!file || isCompressing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold mb-4 transition"
        >
          {isCompressing ? "Compressing..." : "Compress PDF"}
        </button>

        {compressedBlobUrl && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-full p-4 bg-white/10 rounded-lg text-left">
              <p className="text-sm text-white/70">
                Original: <span className="font-semibold">{formatSize(originalSize)}</span>
              </p>
              <p className="text-sm text-white/70 mt-1">
                Compressed: <span className="font-semibold">{formatSize(compressedSize)}</span>
              </p>
              <p className="text-sm text-green-400 mt-1 font-semibold">
                Reduction: {reductionPercent}%
              </p>
            </div>
            <a
              href={compressedBlobUrl}
              download="compressed.pdf"
              className="px-6 py-2 bg-black text-gray-100 rounded-lg hover:bg-gray-800 transition font-semibold w-full"
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




