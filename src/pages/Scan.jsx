import { useState } from "react";
import ImageUpload from "../components/ImageUpload";
import ScanPreview from "../components/ScanPreview";

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
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${baseUrl}/scan`, { method: "POST", body: formData });
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
    <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">OCR Scan</h2>
      <ImageUpload onImageSelect={setImage} />
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
  );
}


