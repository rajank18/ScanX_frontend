import { useState, useEffect } from "react";
import ScanPreview from "../components/ScanPreview";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
import { apiFetch } from "@/lib/api";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";

export default function SimpleCamScanner() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scannedBlobUrl, setScannedBlobUrl] = useState(null);
  const [format, setFormat] = useState("png");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Safely manage local image preview state
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (scannedBlobUrl) URL.revokeObjectURL(scannedBlobUrl);

      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScannedBlobUrl(null);
      setErrorMessage("");
    }
  };

  const handleScan = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("format", format);

    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await apiFetch("/scan", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      setScannedBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to scan document"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up Object URLs when unmounting component
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (scannedBlobUrl) URL.revokeObjectURL(scannedBlobUrl);
    };
  }, [previewUrl, scannedBlobUrl]);

  return (
    <>
      <SEO
        title="Doc Enhancer - Turn Photos into Clean Documents Online"
        description="Free online document enhancer. Upload photos of paper, receipts, or whiteboard notes and clean them up into high-contrast PNG or PDF files."
        keywords="doc enhancer, document enhancer, photo to document, clean document photo, enhance scanned pdf, camscanner filter"
        canonical="/scan"
      />

      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Doc Enhancer
        </h2>
        <p className="text-white/60 mb-6 text-sm">
          Enhance and clean up document photos into clear, high-contrast PNG or PDF files.
        </p>

        {/* Unified File Upload Zone */}
        <UnifiedDropzone
          onFileSelect={(f) => handleImageChange({ target: { files: [f] } })}
          accept="image/*"
          title="Choose Image or Take Photo"
          subtitle="Upload a photo of paper, notes, or receipts to enhance"
          iconType="image"
          className="mb-6"
        />

        {/* Upload Preview */}
        {image && previewUrl && (
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="text-sm text-white/70 mb-2">Original Document</span>
            <img
              src={previewUrl}
              alt="Uploaded document preview"
              className="max-w-xs max-h-60 h-auto rounded-md shadow-md object-contain border border-white/10"
            />
          </div>
        )}

        {/* Scan Actions & Format Picker */}
        {image && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="format" className="text-sm font-medium whitespace-nowrap">
                Output:
              </label>
              <select
                id="format"
                className="border border-white/20 rounded-xl px-4 py-2.5 bg-black/70 text-white font-medium focus:outline-none focus:border-emerald-500 w-full text-sm"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="png">PNG Image</option>
                <option value="pdf">PDF Document</option>
              </select>
            </div>

            <button
              onClick={handleScan}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 font-semibold transition shadow-lg text-sm"
            >
              {isLoading ? "Enhancing..." : "Enhance Document"}
            </button>
          </div>
        )}

        {errorMessage && (
          <p className="mt-2 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
            {errorMessage}
          </p>
        )}

        {/* Output Preview */}
        {scannedBlobUrl && (
          <div className="mt-6">
            <ScanPreview
              scannedBlobUrl={scannedBlobUrl}
              format={format}
              filename={image?.name}
            />
          </div>
        )}

        {!image && (
          <p className="mt-4 text-white/70">
            Upload a photo of paper, notes, or receipts to enhance.
          </p>
        )}
      </div>

      <PageInfoSection
        aboutTitle="About Doc Enhancer"
        aboutText="Doc Enhancer processes photos of physical documents, notes, receipts, and forms to eliminate shadows, whiten background paper, and sharpen text for maximum readability."
        howItWorks={[
          "Upload or capture a photo of a document from your device.",
          "Select your preferred output format (PNG or PDF).",
          "Click Enhance Document to automatically whiten paper, boost contrast, and download.",
        ]}
        faqs={[
          {
            question: "What does Doc Enhancer do?",
            answer: "It normalizes lighting, removes yellow tints and gray shadows, and sharpens ink lines so smartphone photos read like clear scanned documents.",
          },
          {
            question: "Does it work on receipts and handwritten notes?",
            answer: "Yes, high-contrast modulation brings out faint pen strokes and printed receipt text clearly.",
          },
          {
            question: "Can I output as PDF?",
            answer: "Yes, choose PDF in the output dropdown before enhancing.",
          },
        ]}
      />
    </>
  );
}