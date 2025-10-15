import { useState } from "react";
import ImageUpload from "../components/ImageUpload";

export default function ImageCompress() {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedBlobUrl, setCompressedBlobUrl] = useState(null);
  const [targetSize, setTargetSize] = useState(200); // KB
  const [quality, setQuality] = useState(70); // %
  const [errorMessage, setErrorMessage] = useState("");
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [reductionPercent, setReductionPercent] = useState(null);

  const handleCompress = async () => {
    if (!image || !(image instanceof File || image instanceof Blob)) {
      setErrorMessage("Please select a valid image file (JPG/PNG) before compressing.");
      return;
    }
    setIsCompressing(true);
    setErrorMessage("");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("targetSize", targetSize);
    formData.append("quality", quality);
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    try {
      // Set original size when compressing
      setOriginalSize(image.size);

      const res = await fetch(`${baseUrl}/compress-image`, { method: "POST", body: formData });
      if (!res.ok) {
        let errorText = await res.text();
        // Try to parse error JSON
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error || errorText;
        } catch {}
        throw new Error(errorText || `Request failed with ${res.status}`);
      }
      const blob = await res.blob();
      setCompressedSize(blob.size);
      const objectUrl = URL.createObjectURL(blob);
      setCompressedBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });

      // Calculate reduction percentage
      if (image.size && blob.size) {
        const reduction = (((image.size - blob.size) / image.size) * 100).toFixed(2);
        setReductionPercent(reduction);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to compress");
    } finally {
      setIsCompressing(false);
    }
  };

  // Format size to KB
  const formatSize = (bytes) => (bytes / 1024).toFixed(2) + " KB";

  return (
    <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Image Compression</h2>
      <ImageUpload onImageSelect={(file) => { 
        setImage(file); 
        setCompressedBlobUrl(null); 
        setOriginalSize(null);
        setCompressedSize(null);
        setReductionPercent(null);
      }} />
      {errorMessage && (
        <div className="text-red-400 mb-2">{errorMessage}</div>
      )}
      {image && (
        <div className="flex flex-col gap-4 items-center mt-4">
          <label className="w-full max-w-sm text-left">
            Quality: <span className="font-semibold">{quality}%</span>
            <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full" />
          </label>
          <button
            onClick={handleCompress}
            disabled={isCompressing}
            className="w-full px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-60"
          >
            {isCompressing ? "Compressing..." : "Compress Image"}
          </button>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full">
            <div className="flex flex-col items-center">
              <span className="text-sm text-white/70 mb-1">Original</span>
              <img src={image instanceof Blob ? URL.createObjectURL(image) : undefined} alt="original" className="w-64 h-auto rounded-md shadow-md mb-2 max-w-full object-contain" />
            </div>
            {compressedBlobUrl && (
              <div className="flex flex-col items-center">
                <span className="text-sm text-white/70 mb-1">Compressed</span>
                <img src={compressedBlobUrl} alt="compressed" className="w-64 h-auto rounded-md shadow-md mb-2 max-w-full object-contain" />
              </div>
            )}
          </div>
          {originalSize && compressedSize && reductionPercent && (
            <div className="text-sm text-left mt-2">
              <p>Original: {formatSize(originalSize)}</p>
              <p>Compressed: {formatSize(compressedSize)}</p>
              <p>Reduction: {reductionPercent}%</p>
            </div>
          )}
          {compressedBlobUrl && (
            <a 
              href={compressedBlobUrl} 
              download="compressed-image.jpg" 
              className="mt-4 px-4 py-2 bg-black text-gray-100 rounded-md hover:bg-gray-800"
            >
              Download
            </a>
          )}
        </div>
      )}
      {isUploading && <div className="mt-2 text-green-400">Uploading...</div>}
      {!image && <p className="text-white/70">Upload a JPG/PNG image to compress.</p>}
    </div>
  );
}