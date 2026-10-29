import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import PageInfoSection from "@/components/PageInfoSection";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";

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
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">PDF to Word</h2>
        <p className="text-white/60 mb-6 text-sm">Upload a PDF file to convert it to an editable Word document (.docx).</p>
        
        <UnifiedDropzone
          onFileSelect={(f) => handleFileSelect({ target: { files: [f] } })}
          accept=".pdf,application/pdf"
          title="Choose PDF File"
          subtitle="Select a PDF to convert to an editable Word document"
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
          {isLoading ? "Converting..." : "Convert to Word"}
        </button>

        {docxBlobUrl && (
          <div className="flex flex-col items-center mt-4">
            <a
              href={docxBlobUrl}
              download="converted.docx"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition font-semibold shadow-md inline-block text-sm sm:text-base"
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
