import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import PageInfoSection from "@/components/PageInfoSection";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPdfBlobUrl(null);
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
      const res = await apiFetch("/convert/word-to-pdf", { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfBlobUrl((prev) => {
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
        title="Free Word to PDF Converter - Convert DOC & DOCX to PDF Online"
        description="Convert Word documents to PDF online for free. Upload your .doc or .docx file and get a PDF in seconds. Secure, fast, and no registration required."
        keywords="word to pdf, doc to pdf, docx to pdf, convert word to pdf, document converter, online converter"
        canonical="/convertor/word-to-pdf"
      />
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Word to PDF</h2>
        <p className="text-white/60 mb-6 text-sm">Upload a Word document (.doc or .docx) to convert it to PDF format.</p>
        
        <UnifiedDropzone
          onFileSelect={(f) => handleFileSelect({ target: { files: [f] } })}
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          title="Choose Word File"
          subtitle="Select a .doc or .docx file to convert"
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
          {isLoading ? "Converting..." : "Convert to PDF"}
        </button>

        {pdfBlobUrl && (
          <div className="flex flex-col items-center mt-4">
            <a
              href={pdfBlobUrl}
              download="converted.pdf"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition font-semibold shadow-md inline-block text-sm sm:text-base"
            >
              Download PDF
            </a>
          </div>
        )}

        {!file && <p className="mt-4 text-white/70">Upload a Word document to get started.</p>}
      </div>
      <PageInfoSection
        aboutTitle="About Word to PDF"
        aboutText="Word to PDF helps convert DOC and DOCX files into portable PDF documents that look consistent across devices. It is useful for sharing resumes, contracts, reports, and print-ready files."
        howItWorks={[
          "Upload a .doc or .docx document.",
          "Start conversion to create a PDF version.",
          "Download the converted PDF file.",
        ]}
        faqs={[
          {
            question: "Will document formatting be kept?",
            answer: "Most standard formatting is preserved in the generated PDF output.",
          },
          {
            question: "Can I convert DOCX files?",
            answer: "Yes, both DOC and DOCX inputs are supported.",
          },
          {
            question: "Why use PDF instead of Word for sharing?",
            answer: "PDF is more consistent for viewing and printing across platforms.",
          },
        ]}
      />
    </>
  );
}
