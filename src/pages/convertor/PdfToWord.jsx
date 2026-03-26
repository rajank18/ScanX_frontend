import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import PageInfoSection from "@/components/PageInfoSection";

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [docxBlobUrl, setDocxBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDocxBlobUrl(null);
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
      const res = await apiFetch("/convert/pdf-to-word", { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setDocxBlobUrl((prev) => {
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
        title="Free PDF to Word Converter - Convert PDF to DOC & DOCX Online"
        description="Convert PDF files to editable Word documents (.docx) online for free. Upload your PDF and download as Word in seconds. Easy and secure."
        keywords="pdf to word, pdf to docx, convert pdf to word, pdf converter, document converter, online converter"
        canonical="/convertor/pdf-to-word"
      />
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">PDF to Word</h2>
        <p className="text-white/70 mb-6">Upload a PDF file to convert it to an editable Word document (.docx).</p>
        
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
          {isLoading ? "Converting..." : "Convert to Word"}
        </button>

        {docxBlobUrl && (
          <div className="flex flex-col items-center">
            <a
              href={docxBlobUrl}
              download="converted.docx"
              className="px-6 py-2 bg-black text-gray-100 rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              Download Word
            </a>
          </div>
        )}

        {!file && <p className="mt-4 text-white/70">Upload a PDF file to get started.</p>}
      </div>
      <PageInfoSection
        aboutTitle="About PDF to Word"
        aboutText="PDF to Word converts PDF documents into editable DOCX files so you can update content, reuse text, and continue document editing workflows in Word-compatible editors."
        howItWorks={[
          "Upload the source PDF file.",
          "Run conversion to generate an editable Word document.",
          "Download the DOCX output for editing.",
        ]}
        faqs={[
          {
            question: "Is the output editable?",
            answer: "Yes, the generated DOCX file is intended for editing in Word-compatible tools.",
          },
          {
            question: "Does this work for scanned PDFs?",
            answer: "Scanned PDFs may require OCR quality support; text-based PDFs usually convert better.",
          },
          {
            question: "Can I reuse converted content in reports?",
            answer: "Yes, once converted to DOCX you can edit and reuse the content as needed.",
          },
        ]}
      />
    </>
  );
}
