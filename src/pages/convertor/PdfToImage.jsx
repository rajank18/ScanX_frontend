import { useState } from "react";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";

export default function PdfToImage() {
  const [file, setFile] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrls([]);
      setErrorMessage("");
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${baseUrl}/convert/pdf-to-images`, { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      
      const data = await res.json();
      setImageUrls(data.images || []);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to convert");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Free PDF to Image Converter - Convert PDF to JPG & PNG Online"
        description="Extract images from PDF or convert PDF pages to image files (JPG, PNG) online for free. Download individual pages as images instantly."
        keywords="pdf to image, pdf to jpg, pdf to png, extract images from pdf, convert pdf pages to images, online converter"
        canonical="/convertor/pdf-to-images"
      />
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">PDF to Images</h2>
        <p className="text-white/70 mb-6">Upload a PDF file to convert each page into individual image files.</p>
        
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
          </div>
        )}

        {errorMessage && (
          <div className="text-red-400 mb-4 p-3 bg-red-400/10 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold mb-4 transition"
        >
          {isLoading ? "Converting..." : "Convert to Images"}
        </button>

        {imageUrls.length > 0 && (
          <div className="mt-6">
            <p className="text-white/70 mb-4">Converted to {imageUrls.length} image(s)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <img src={url} alt={`Page ${idx + 1}`} className="w-full max-h-48 object-contain rounded-lg mb-2" />
                  <a
                    href={url}
                    download={`page-${idx + 1}.png`}
                    className="px-4 py-1 bg-black text-sm text-gray-100 rounded hover:bg-gray-800 transition"
                  >
                    Download Page {idx + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {!file && <p className="mt-4 text-white/70">Upload a PDF file to get started.</p>}
      </div>
      <PageInfoSection
        aboutTitle="About PDF to Images"
        aboutText="PDF to Images extracts pages from a PDF and converts them into downloadable image files. It is useful when you need slide previews, social image snippets, or visual page sharing."
        howItWorks={[
          "Upload a PDF document.",
          "Convert pages to image outputs.",
          "Download each page image individually.",
        ]}
        faqs={[
          {
            question: "Will every PDF page be converted?",
            answer: "Yes, each page is processed and listed as a separate downloadable image.",
          },
          {
            question: "Can I download only selected pages?",
            answer: "You can choose to download only the page images you need from the list.",
          },
          {
            question: "Is this helpful for presentations?",
            answer: "Yes, page images can be reused in slides, thumbnails, or design tools.",
          },
        ]}
      />
    </>
  );
}
