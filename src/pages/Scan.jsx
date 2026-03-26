import { useState } from "react";
// ...existing code...
import ScanPreview from "../components/ScanPreview";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
import { apiFetch } from "@/lib/api";

export default function Scan() {
  const [image, setImage] = useState(null);
  const [scannedBlobUrl, setScannedBlobUrl] = useState(null);
  const [format, setFormat] = useState("png");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleScan = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);
    formData.append("format", format === "pdf" ? "pdf" : "");
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await apiFetch("/scan", { method: "POST", body: formData });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setScannedBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to scan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Free OCR Scanner - Convert Images to PDF or PNG"
        description="Free online OCR scanner tool. Upload images and convert them to PDF or PNG format with optical character recognition. Fast, secure, and works in your browser."
        keywords="ocr scanner, image to pdf, image to png, online scanner, document scanner, scanx ocr"
        canonical="/scan"
      />
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">OCR Scan</h2>
      <label className="block w-full mb-4 p-2 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10">
        <span className="text-white/80">Choose Image or Take Photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files[0];
            if (file) setImage(file);
          }}
          className="hidden"
        />
      </label>
      {image && (
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-4">
          <div className="flex flex-col items-center">
            <span className="text-sm text-white/70 mb-1">Original</span>
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="w-50 max-w-xs h-auto rounded-md shadow-md object-contain"
            />
          </div>
          {/* {scannedBlobUrl && format === "png" && (
            <div className="flex flex-col items-center">
              <span className="text-sm text-white/70 mb-1">Scanned</span>
              <img
                src={scannedBlobUrl}
                alt="scanned"
                className="w-full max-w-xs h-auto rounded-md shadow-md object-contain"
              />
            </div>
          )} */}
        </div>
      )}
      {image && (
        <div className="flex flex-col gap-4 items-center mt-4">
          <button
            onClick={handleScan}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-60"
          >
            {isLoading ? "Scanning..." : "Scan"}
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-4 max-w-sm mx-auto">
        <label className="text-sm font-medium" htmlFor="format">Output</label>
        <select
          id="format"
          className="border rounded-xl px-2 py-1 bg-gray-200 text-black"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="png">PNG</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      {errorMessage && <p className="mt-2 text-sm text-red-400">{errorMessage}</p>}
      {/* Always show ScanPreview for both PNG and PDF, but only show image preview for PNG inside ScanPreview */}
      {scannedBlobUrl && (
        <ScanPreview scannedBlobUrl={scannedBlobUrl} format={format} />
      )}
      {isLoading && <div className="mt-2 text-green-400">Scanning...</div>}
      {!image && <p className="mt-2 text-white/70">Upload an image to scan.</p>}
      </div>
      <PageInfoSection
        aboutTitle="About OCR Scan"
        aboutText="The OCR Scan tool helps convert image-based documents into usable output formats like PNG and PDF. It is designed for receipts, notes, forms, and photo documents where you want a cleaner digital version."
        howItWorks={[
          "Upload or capture an image from your device.",
          "Select your preferred output format (PNG or PDF).",
          "Run scan and download the generated file.",
        ]}
        faqs={[
          {
            question: "What images work best for OCR scan?",
            answer: "Clear, high-contrast images with readable text and minimal blur give the best results.",
          },
          {
            question: "Can I scan photos from mobile?",
            answer: "Yes, you can upload images from phone camera or gallery directly in the browser.",
          },
          {
            question: "Can I output as PDF?",
            answer: "Yes, choose PDF in the output dropdown before running scan.",
          },
        ]}
      />
    </>
  );
}


