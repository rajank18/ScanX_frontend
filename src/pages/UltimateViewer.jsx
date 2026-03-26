import { useState } from "react";
import SEO from "@/components/SEO";
import * as XLSX from "xlsx";

export default function UltimateViewer() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [viewerContent, setViewerContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pdfPages, setPdfPages] = useState(null);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [excelSheets, setExcelSheets] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [docxContent, setDocxContent] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage("");
    setViewerContent(null);
    setPdfPages(null);
    setDocxContent(null);
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
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${await import("pdfjs-dist/package.json").then(m => m.default.version)}/pdf.worker.min.js`;
        
        const pdf = await getDocument({ data: event.target.result }).promise;
        setPdfPages(pdf.numPages);
        
        // Render first page
        const page = await pdf.getPage(1);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        setViewerContent(canvas.toDataURL());
      } catch (err) {
        setErrorMessage("Failed to load PDF. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDocxFile = (file) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      try {
        const JSZip = (await import("jszip")).default;
        
        // For DOCX preview, extract text from document.xml
        const arrayBuffer = e.target.result;
        const zip = new JSZip();
        await zip.loadAsync(arrayBuffer);
        
        // Get document.xml for text content
        const docXml = await zip.file("word/document.xml").async("string");
        
        // Extract text content from XML
        const textMatch = docXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
        const textContent = textMatch
          .map(t => t.replace(/<[^>]+>/g, ""))
          .join(" ");
        
        setViewerContent(textContent || "Document loaded but no text content found.");
        setDocxContent(textContent);
      } catch (err) {
        setErrorMessage("Failed to load DOCX. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
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
        setViewerContent(sheets[0]?.data || []);
      } catch (err) {
        setErrorMessage("Failed to load Excel file. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
  };

  const handlePdfPageChange = async (pageNum) => {
    if (!file || pageNum < 1 || pageNum > pdfPages) return;
    
    setCurrentPdfPage(pageNum);
    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        
        const pdf = await getDocument({ data: event.target.result }).promise;
        const page = await pdf.getPage(pageNum);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        setViewerContent(canvas.toDataURL());
      } catch (err) {
        setErrorMessage("Failed to render page. " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
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
            <p className="text-green-400 font-semibold">Loading...</p>
          </div>
        )}

        {/* PDF Viewer */}
        {fileType === "pdf" && viewerContent && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">PDF Viewer</h3>
              <span className="text-sm text-white/70">Page {currentPdfPage} of {pdfPages}</span>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 mb-4 flex justify-center max-h-96 overflow-auto">
              <img src={viewerContent} alt={`PDF Page ${currentPdfPage}`} className="max-w-full h-auto" />
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => handlePdfPageChange(1)}
                disabled={currentPdfPage <= 1 || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm"
              >
                First
              </button>
              <button
                onClick={() => handlePdfPageChange(currentPdfPage - 1)}
                disabled={currentPdfPage <= 1 || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm"
              >
                Previous
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
                className="w-16 px-2 py-1 bg-white/10 border border-white/30 rounded text-white text-center text-sm"
              />
              
              <button
                onClick={() => handlePdfPageChange(currentPdfPage + 1)}
                disabled={currentPdfPage >= pdfPages || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm"
              >
                Next
              </button>
              <button
                onClick={() => handlePdfPageChange(pdfPages)}
                disabled={currentPdfPage >= pdfPages || isLoading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* DOCX Viewer */}
        {fileType === "docx" && docxContent && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h3 className="text-lg font-semibold mb-4">Document Preview</h3>
            <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-auto">
              <p className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">
                {docxContent}
              </p>
            </div>
          </div>
        )}

        {/* Excel Viewer */}
        {fileType === "excel" && excelSheets.length > 0 && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-semibold">Excel Spreadsheet</h3>
              {excelSheets.length > 1 && (
                <div className="flex gap-2">
                  {excelSheets.map((sheet, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSheet(idx)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        currentSheet === idx
                          ? "bg-blue-600 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-black/30 rounded-lg overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {excelSheets[currentSheet]?.data?.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-white/10 hover:bg-white/5">
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-4 py-2 border-r border-white/10 text-white/90 min-w-[100px]"
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
          <div className="text-center text-white/70 py-8">
            <p>Upload a document to preview it here</p>
          </div>
        )}
      </div>
    </>
  );
}
