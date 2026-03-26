import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";

export default function JpgToPng() {
  const [image, setImage] = useState(null);
  const [pngBlobUrl, setPngBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(selectedFile);
      setPngBlobUrl(null);
      setErrorMessage("");
    }
  };

  const handleConvert = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await apiFetch("/convert/jpg-to-png", { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPngBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to convert");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Free JPG to PNG Converter - Convert JPEG to PNG Online"
        description="Convert JPG/JPEG images to PNG format online for free. Upload your JPG image and download as PNG with transparency support."
        keywords="jpg to png, jpeg to png, convert jpg to png, image converter, online converter"
        canonical="/convertor/jpg-to-png"
      />
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">JPG to PNG</h2>
        <p className="text-white/70 mb-6">Upload a JPG/JPEG image to convert it to PNG format with transparency support.</p>
        
        <label className="block w-full mb-4 p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
          <span className="text-white/80">Choose JPG Image</span>
          <input
            type="file"
            accept=".jpg,.jpeg,image/jpeg"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>

        {image && (
          <div className="mb-4">
            <div className="flex justify-center mb-3">
              <img src={URL.createObjectURL(image)} alt="preview" className="max-w-xs h-auto rounded-lg shadow-md" />
            </div>
            <p className="text-sm text-white/70">Selected: <span className="font-semibold">{image.name}</span></p>
          </div>
        )}

        {errorMessage && (
          <div className="text-red-400 mb-4 p-3 bg-red-400/10 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!image || isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold mb-4 transition"
        >
          {isLoading ? "Converting..." : "Convert to PNG"}
        </button>

        {pngBlobUrl && (
          <div className="flex flex-col items-center">
            <a
              href={pngBlobUrl}
              download="converted.png"
              className="px-6 py-2 bg-black text-gray-100 rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              Download PNG
            </a>
          </div>
        )}

        {!image && <p className="mt-4 text-white/70">Upload a JPG image to get started.</p>}
      </div>
    </>
  );
}
