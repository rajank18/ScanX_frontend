import { useState } from "react";
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";

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
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${baseUrl}/convert/word-to-pdf`, { 
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
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Word to PDF</h2>
        <p className="text-white/70 mb-6">Upload a Word document (.doc or .docx) to convert it to PDF format.</p>
        
        <label className="block w-full mb-4 p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
          <span className="text-white/80">Choose Word File</span>
          <input
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          {isLoading ? "Converting..." : "Convert to PDF"}
        </button>

        {pdfBlobUrl && (
          <div className="flex flex-col items-center">
            <a
              href={pdfBlobUrl}
              download="converted.pdf"
              className="px-6 py-2 bg-black text-gray-100 rounded-lg hover:bg-gray-800 transition font-semibold"
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
