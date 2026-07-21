import { useState, useEffect } from "react";
import ScanPreview from "../components/ScanPreview";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
import { apiFetch } from "@/lib/api";

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
        title="Simple CamScanner - Convert Images to Clean Documents"
        description="Free online document scanner tool. Upload photos of notes or receipts and clean them up into PNG or PDF format."
        keywords="camscanner, document scanner, scan image to pdf, image to png scanner, simple camscanner"
        canonical="/scan"
      />

      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">
          Simple CamScanner
        </h2>
        <p className="text-white/70 mb-6 text-sm">
          Enhance and clean up document photos into clear PNG or PDF files.
        </p>

        {/* File Upload Zone */}
        <label className="block w-full mb-4 p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
          <span className="text-white/80 font-medium">
            Choose Image or Take Photo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

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
                className="border rounded-lg px-3 py-2 bg-gray-100 text-black font-medium focus:outline-none w-full"
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
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-semibold transition"
            >
              {isLoading ? "Scanning..." : "Scan Document"}
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
            Upload an image to start scanning.
          </p>
        )}
      </div>

      <PageInfoSection
        aboutTitle="About Simple CamScanner"
        aboutText="Simple CamScanner converts photos of paper documents, receipts, whiteboard notes, and forms into clear, high-contrast images or PDFs."
        howItWorks={[
          "Upload or capture an image from your device.",
          "Select your preferred output format (PNG or PDF).",
          "Click Scan Document to sharpen contrast and download your clean file.",
        ]}
        faqs={[
          {
            question: "What images work best?",
            answer: "Flat photos taken under good lighting with minimal glare yield the clearest document scans.",
          },
          {
            question: "Can I scan photos on mobile?",
            answer: "Yes, you can upload directly from your mobile camera or photo gallery.",
          },
          {
            question: "Can I output as PDF?",
            answer: "Yes, choose PDF in the output dropdown before scanning.",
          },
        ]}
      />
    </>
  );
}