import { useState } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";

export default function ExcelToPdf() {
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
      const res = await apiFetch("/convert/excel-to-pdf", { 
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
        title="Free Excel to PDF Converter - Convert XLS & XLSX to PDF Online"
        description="Convert Excel spreadsheets to PDF online for free. Upload your .xls or .xlsx file and get a PDF in seconds. No registration needed."
        keywords="excel to pdf, xls to pdf, xlsx to pdf, spreadsheet to pdf, convert excel to pdf, online converter"
        canonical="/convertor/excel-to-pdf"
      />
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Excel to PDF</h2>
        <p className="text-white/60 mb-6 text-sm">Upload an Excel spreadsheet (.xls or .xlsx) to convert it to PDF format.</p>
        
        <UnifiedDropzone
          onFileSelect={(f) => handleFileSelect({ target: { files: [f] } })}
          accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          title="Choose Excel File"
          subtitle="Select a .xls or .xlsx spreadsheet to convert"
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

        {!file && <p className="mt-4 text-white/70">Upload an Excel file to get started.</p>}
      </div>
    </>
  );
}
