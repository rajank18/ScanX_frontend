import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";

export default function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [xlsxBlobUrl, setXlsxBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setXlsxBlobUrl(null);
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
      const res = await apiFetch("/convert/pdf-to-excel", { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setXlsxBlobUrl((prev) => {
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
        title="Free PDF to Excel Converter - Convert PDF to XLS & XLSX Online"
        description="Convert PDF tables to Excel spreadsheets (.xlsx) online for free. Extract tables from PDF and get editable Excel files instantly."
        keywords="pdf to excel, pdf to xlsx, pdf table to excel, convert pdf to excel, spreadsheet converter, online converter"
        canonical="/convertor/pdf-to-excel"
      />
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">PDF to Excel</h2>
        <p className="text-white/60 mb-6 text-sm">Upload a PDF file with tables to convert it to an Excel spreadsheet (.xlsx).</p>
        
        <UnifiedDropzone
          onFileSelect={(f) => handleFileSelect({ target: { files: [f] } })}
          accept=".pdf,application/pdf"
          title="Choose PDF File"
          subtitle="Select a PDF containing tables to convert"
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
          {isLoading ? "Converting..." : "Convert to Excel"}
        </button>

        {xlsxBlobUrl && (
          <div className="flex flex-col items-center mt-4">
            <a
              href={xlsxBlobUrl}
              download="converted.xlsx"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition font-semibold shadow-md inline-block text-sm sm:text-base"
            >
              Download Excel
            </a>
          </div>
        )}

        {!file && <p className="mt-4 text-white/70">Upload a PDF file to get started.</p>}
      </div>
    </>
  );
}
