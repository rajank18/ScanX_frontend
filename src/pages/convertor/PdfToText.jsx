import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import PageInfoSection from "@/components/PageInfoSection";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";

export default function PdfToText() {
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTextContent("");
      setErrorMessage("");
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await apiFetch("/convert/pdf-to-text", { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      
      const data = await res.json();
      setTextContent(data.text || "");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to convert");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([textContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "extracted-text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      <SEO 
        title="Free PDF to Text Converter - Extract Text from PDF Online"
        description="Extract text from PDF files online for free. Convert PDF to plain text instantly. No registration required. Download as .txt file."
        keywords="pdf to text, extract text from pdf, pdf text extractor, convert pdf to text, online converter"
        canonical="/convertor/pdf-to-text"
      />
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">PDF to Text</h2>
        <p className="text-white/60 mb-6 text-sm">Upload a PDF file to extract all text content as a plain text file.</p>
        
        <UnifiedDropzone
          onFileSelect={(f) => handleFileSelect({ target: { files: [f] } })}
          accept=".pdf,application/pdf"
          title="Choose PDF File"
          subtitle="Select a PDF to extract text from"
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
          {isLoading ? "Extracting..." : "Extract Text"}
        </button>

        {textContent && (
          <div className="mt-6 text-left">
            <textarea
              value={textContent}
              readOnly
              className="w-full h-48 p-3 bg-black/60 border border-white/20 rounded-xl text-white/90 resize-none focus:outline-none text-sm font-mono"
            />
            <button
              onClick={handleDownload}
              className="w-full mt-3 py-2.5 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition font-semibold shadow-md text-sm sm:text-base"
            >
              Download as TXT
            </button>
          </div>
        )}

        {!file && <p className="mt-4 text-white/70">Upload a PDF file to get started.</p>}
      </div>
      <PageInfoSection
        aboutTitle="About PDF to Text"
        aboutText="PDF to Text extracts readable text content from PDF documents and lets you download it as a plain TXT file. It is ideal for quick copy, search, summarization, and content reuse workflows."
        howItWorks={[
          "Upload the PDF you want to process.",
          "Extract text content from the file.",
          "Review text and download as a .txt document.",
        ]}
        faqs={[
          {
            question: "Can I copy extracted text directly?",
            answer: "Yes, extracted text is shown in a textarea so you can copy it before downloading.",
          },
          {
            question: "Will scanned image-only PDFs work?",
            answer: "Image-only PDFs may need OCR-based extraction for best results.",
          },
          {
            question: "What format is downloaded?",
            answer: "The output is downloaded as a plain text (.txt) file.",
          },
        ]}
      />
    </>
  );
}
