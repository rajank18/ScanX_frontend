import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfToImage() {
  const [file, setFile] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Clean up all generated blob URLs on unmount or file reset
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

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

    imageUrls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;

      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Failed to initialize canvas context");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((result) => {
            if (!result) {
              reject(new Error("Failed to render page image"));
              return;
            }
            resolve(result);
          }, "image/png");
        });

        pages.push(URL.createObjectURL(blob));
      }

      setImageUrls(pages);
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
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">PDF to Images</h2>
        <p className="text-white/60 mb-6 text-sm">Upload a PDF file to convert each page into individual image files.</p>
        
        <UnifiedDropzone
          onFileSelect={(f) => handleFileSelect({ target: { files: [f] } })}
          accept=".pdf,application/pdf"
          title="Choose PDF File"
          subtitle="Select a PDF to extract pages as images"
          iconType="file"
          className="mb-6"
        />

        {file && (
          <div className="mb-6 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg inline-block">
            <p className="text-xs font-semibold text-emerald-300">Selected: {file.name}</p>
          </div>
        )}

        {errorMessage && (
          <div className="text-red-400 mb-6 p-3 bg-red-400/10 rounded-lg text-sm border border-red-500/20">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isLoading}
          className="w-full py-3 px-6 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold mb-4 transition shadow-lg text-sm sm:text-base"
        >
          {isLoading ? "Converting..." : "Convert to Images"}
        </button>

        {imageUrls.length > 0 && (
          <div className="mt-6">
            <p className="text-white/70 mb-4 text-sm font-medium">Converted to {imageUrls.length} image(s)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <img src={url} alt={`Page ${idx + 1}`} className="w-full max-h-48 object-contain rounded-lg mb-2" />
                  <a
                    href={url}
                    download={`page-${idx + 1}.png`}
                    className="px-4 py-1.5 bg-emerald-600 text-xs text-white font-medium rounded-lg hover:bg-emerald-500 transition shadow"
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
