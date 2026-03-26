import { useState } from "react";
import SEO from "@/components/SEO";

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
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${baseUrl}/convert/excel-to-pdf`, { 
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
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Excel to PDF</h2>
        <p className="text-white/70 mb-6">Upload an Excel spreadsheet (.xls or .xlsx) to convert it to PDF format.</p>
        
        <label className="block w-full mb-4 p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
          <span className="text-white/80">Choose Excel File</span>
          <input
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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

        {!file && <p className="mt-4 text-white/70">Upload an Excel file to get started.</p>}
      </div>
    </>
  );
}
