import { useState } from "react";
import SEO from "@/components/SEO";

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
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${baseUrl}/convert/pdf-to-excel`, { 
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
      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">PDF to Excel</h2>
        <p className="text-white/70 mb-6">Upload a PDF file with tables to convert it to an Excel spreadsheet (.xlsx).</p>
        
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
          {isLoading ? "Converting..." : "Convert to Excel"}
        </button>

        {xlsxBlobUrl && (
          <div className="flex flex-col items-center">
            <a
              href={xlsxBlobUrl}
              download="converted.xlsx"
              className="px-6 py-2 bg-black text-gray-100 rounded-lg hover:bg-gray-800 transition font-semibold"
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
