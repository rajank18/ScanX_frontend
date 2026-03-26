import { useState, useRef, useEffect } from "react";
import SEO from "@/components/SEO";
import * as XLSX from "xlsx";
import { renderAsync } from "docx-preview";
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function UltimateViewer() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pdfPages, setPdfPages] = useState(null);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [excelSheets, setExcelSheets] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(0);
  const pdfContainerRef = useRef(null);
  const docxContainerRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage("");
    setPdfPages(null);
    setExcelSheets([]);
    setCurrentPdfPage(1);
    setCurrentSheet(0);

    const fileName = selectedFile.name.toLowerCase();
    
    if (fileName.endsWith(".pdf")) {
      setFileType("pdf");
      handlePdfFile(selectedFile);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      setFileType("docx");
      handleDocxFile(selectedFile);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
      setFileType("excel");
      handleExcelFile(selectedFile);
    } else {
      setErrorMessage("Unsupported file type. Please upload PDF, DOCX, or Excel files.");
      setFileType(null);
    }
  };

  const handlePdfFile = (file) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const pdf = await pdfjs.getDocument({ data: event.target.result }).promise;
        setPdfPages(pdf.numPages);
        renderPdfPage(pdf, 1);
      } catch (err) {
        setErrorMessage("Failed to load PDF. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const renderPdfPage = async (pdf, pageNum) => {
    try {
      setIsLoading(true);
      const page = await pdf.getPage(pageNum);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      
      if (pdfContainerRef.current) {
        pdfContainerRef.current.innerHTML = "";
        pdfContainerRef.current.appendChild(canvas);
      }
      setCurrentPdfPage(pageNum);
    } catch (err) {
      setErrorMessage("Failed to render page. " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfPageChange = async (pageNum) => {
    if (!file || pageNum < 1 || pageNum > pdfPages) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const pdf = await pdfjs.getDocument({ data: event.target.result }).promise;
        await renderPdfPage(pdf, pageNum);
      } catch (err) {
        setErrorMessage("Failed to render page. " + (err.message || ""));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDocxFile = (file) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (docxContainerRef.current) {
          docxContainerRef.current.innerHTML = "";
          await renderAsync(e.target.result, docxContainerRef.current, null, {
            className: "docx-preview",
            ignoreLastRenderedPageBreak: true,
          });
        }
      } catch (err) {
        console.error("DOCX Error:", err);
        setErrorMessage("Failed to load DOCX. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelFile = (file) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheets = [];
        
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          sheets.push({ name: sheetName, data: jsonData });
        });
        
        setExcelSheets(sheets);
        setCurrentSheet(0);
      } catch (err) {
        setErrorMessage("Failed to load Excel file. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
  };

  return (
    <>
      <SEO 
        title="Ultimate Document Viewer - View PDF, DOCX, Excel Online"
        description="View PDF, Word documents (.docx), and Excel spreadsheets (.xlsx, .xls) directly in your browser. Fast, secure, and no installation required."
        keywords="document viewer, pdf viewer, docx viewer, excel viewer, xlsx viewer, xls viewer, online document viewer"
        canonical="/viewer"
      />
      <div className="w-full max-w-6xl mx-auto text-gray-100">
        <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">Ultimate Document Viewer</h2>
          <p className="text-white/70 text-center mb-6">View PDF, Word documents, and Excel spreadsheets directly in your browser</p>
          
          <label className="block w-full p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
            <span className="text-white/80">Choose a file (PDF, DOCX, XLS, XLSX)</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-white/70">Selected: <span className="font-semibold">{file.name}</span></p>
              <p className="text-xs text-white/50 mt-1">Type: {fileType?.toUpperCase()}</p>
            </div>
          )}

          {errorMessage && (
            <div className="text-red-400 mt-4 p-3 bg-red-400/10 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
            <p className="text-green-400 font-semibold">Loading document...</p>
          </div>
        )}

        {/* PDF Viewer */}
        {fileType === "pdf" && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">PDF Viewer</h3>
              <span className="text-sm text-white/70">Page {currentPdfPage} of {pdfPages}</span>
            </div>
            
            <div 
              ref={pdfContainerRef} 
              className="bg-black/50 rounded-lg p-4 mb-4 flex justify-center overflow-auto max-h-[600px]"
              style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}
            />

            <div className="flex gap-2 justify-center flex-wrap sticky bottom-0 bg-black/20 p-3 rounded">
              <button
                onClick={() => handlePdfPageChange(1)}
                disabled={currentPdfPage <= 1 || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-semibold transition"
              >
                First
              </button>
              <button
                onClick={() => handlePdfPageChange(currentPdfPage - 1)}
                disabled={currentPdfPage <= 1 || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-semibold transition"
              >
                ← Previous
              </button>
              
              <input
                type="number"
                min={1}
                max={pdfPages}
                value={currentPdfPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value) || 1;
                  if (page >= 1 && page <= pdfPages) {
                    handlePdfPageChange(page);
                  }
                }}
                className="w-16 px-2 py-1 bg-white/10 border border-white/30 rounded text-white text-center text-sm font-semibold"
              />
              
              <button
                onClick={() => handlePdfPageChange(currentPdfPage + 1)}
                disabled={currentPdfPage >= pdfPages || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-semibold transition"
              >
                Next →
              </button>
              <button
                onClick={() => handlePdfPageChange(pdfPages)}
                disabled={currentPdfPage >= pdfPages || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-semibold transition"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* DOCX Viewer */}
        {fileType === "docx" && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h3 className="text-lg font-semibold mb-4">Document Viewer</h3>
            <div 
              ref={docxContainerRef} 
              className="bg-white text-black rounded-lg p-8 min-h-[400px] max-h-[600px] overflow-auto shadow-lg"
              style={{ 
                fontSize: "12pt",
                fontFamily: "Calibri, Arial, sans-serif",
                lineHeight: "1.6",
                color: "#000",
                background: "white"
              }}
            />
          </div>
        )}

        {/* Excel Viewer */}
        {fileType === "excel" && excelSheets.length > 0 && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-semibold">Excel Spreadsheet</h3>
              {excelSheets.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {excelSheets.map((sheet, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSheet(idx)}
                      className={`px-4 py-2 rounded text-sm transition font-semibold ${
                        currentSheet === idx
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-black/30 rounded-lg overflow-auto max-h-[600px] border border-white/20">
              <table className="w-full text-sm border-collapse font-mono">
                <tbody>
                  {excelSheets[currentSheet]?.data?.map((row, rowIdx) => (
                    <tr 
                      key={rowIdx} 
                      className={`border-b border-white/10 ${rowIdx === 0 ? 'bg-blue-600/30' : 'hover:bg-white/5'}`}
                    >
                      <td className="px-3 py-2 border-r border-white/10 text-white/70 min-w-[50px] text-right bg-black/40 font-semibold sticky left-0">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-4 py-2 border-r border-white/10 min-w-[100px] ${
                            rowIdx === 0 
                              ? "text-white font-bold bg-blue-600/20" 
                              : "text-white/90"
                          }`}
                        >
                          {cell !== null && cell !== undefined ? String(cell) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!file && (
          <div className="text-center text-white/70 py-12">
            <p className="text-lg">Upload a document to preview it here</p>
            <p className="text-sm mt-2">Supports PDF, DOCX, XLS, and XLSX files</p>
          </div>
        )}
      </div>
    </>
  );
}
