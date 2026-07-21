import { useState, useEffect } from "react";
import SEO from "@/components/SEO";

// Native conversion: Decodes image directly and handles white background for PNG transparency
async function convertImageBlob(file, outputMimeType, quality = 0.9) {
  const imageBitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to initialize canvas context");
  }

  // Fill background white before exporting JPEG to avoid black alpha areas
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imageBitmap, 0, 0);

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to convert image"));
          return;
        }
        resolve(blob);
      },
      outputMimeType,
      quality
    );
  });
}

export default function PngToJpg() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [jpgBlobUrl, setJpgBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (jpgBlobUrl) URL.revokeObjectURL(jpgBlobUrl);

      setImage(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setJpgBlobUrl(null);
      setErrorMessage("");
    }
  };

  const handleConvert = async () => {
    if (!image) return;
    try {
      setIsLoading(true);
      setErrorMessage("");

      const blob = await convertImageBlob(image, "image/jpeg", 0.9);
      const objectUrl = URL.createObjectURL(blob);

      setJpgBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to convert image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up Object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (jpgBlobUrl) URL.revokeObjectURL(jpgBlobUrl);
    };
  }, [previewUrl, jpgBlobUrl]);

  return (
    <>
      <SEO
        title="Free PNG to JPG Converter - Convert PNG to JPEG Online"
        description="Convert PNG images to JPG/JPEG format online for free. Upload your PNG image and download as JPG with adjustable quality."
        keywords="png to jpg, png to jpeg, convert png to jpg, image converter, online converter"
        canonical="/convertor/png-to-jpg"
      />
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">PNG to JPG</h2>
        <p className="text-white/70 mb-6">
          Upload a PNG image to convert it to JPG/JPEG format with compression.
        </p>

        <label className="block w-full mb-4 p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
          <span className="text-white/80">Choose PNG Image</span>
          <input
            type="file"
            accept=".png,image/png"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>

        {image && previewUrl && (
          <div className="mb-4">
            <div className="flex justify-center mb-3">
              <img
                src={previewUrl}
                alt="preview"
                className="max-w-xs h-auto rounded-lg shadow-md"
              />
            </div>
            <p className="text-sm text-white/70">
              Selected: <span className="font-semibold">{image.name}</span>
            </p>
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
          {isLoading ? "Converting..." : "Convert to JPG"}
        </button>

        {jpgBlobUrl && (
          <div className="flex flex-col items-center">
            <a
              href={jpgBlobUrl}
              download={`${image?.name ? image.name.replace(/\.[^/.]+$/, "") : "converted"}.jpg`}
              className="px-6 py-2 bg-black text-gray-100 rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              Download JPG
            </a>
          </div>
        )}

        {!image && (
          <p className="mt-4 text-white/70">
            Upload a PNG image to get started.
          </p>
        )}
      </div>
    </>
  );
}