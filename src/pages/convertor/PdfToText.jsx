import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import PageInfoSection from "@/components/PageInfoSection";

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
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">PDF to Text</h2>
        <p className="text-white/70 mb-6">Upload a PDF file to extract all text content as a plain text file.</p>
        
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
          {isLoading ? "Extracting..." : "Extract Text"}
        </button>

        {textContent && (
          <div className="mt-6 text-left">
            <textarea
              value={textContent}
              readOnly
              className="w-full h-48 p-3 bg-white/5 border border-white/20 rounded-lg text-white/80 resize-none focus:outline-none"
            />
            <button
              onClick={handleDownload}
              className="w-full mt-3 px-4 py-2 bg-black text-gray-100 rounded-lg hover:bg-gray-800 transition font-semibold"
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
