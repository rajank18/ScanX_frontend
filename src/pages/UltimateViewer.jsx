import { useEffect, useRef, useState } from "react";
import SEO from "@/components/SEO";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import WebViewer from "@pdftron/webviewer";
import ExcelJS from "exceljs";

export default function UltimateViewer() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [docs, setDocs] = useState([]);
  const [excelSheets, setExcelSheets] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(0);

  const pdfViewerRef = useRef(null);
  const instanceRef = useRef(null);
  const pendingPdfUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pendingPdfUrlRef.current) {
        URL.revokeObjectURL(pendingPdfUrlRef.current);
        pendingPdfUrlRef.current = null;
      }
      docs.forEach((document) => {
        if (document?.uri?.startsWith("blob:")) {
          URL.revokeObjectURL(document.uri);
        }
      });
    };
  }, [docs]);

  useEffect(() => {
    if (fileType !== "pdf" || !pdfViewerRef.current || instanceRef.current) {
      return;
    }

    WebViewer(
      {
        path: "https://cdn.jsdelivr.net/npm/@pdftron/webviewer@10.3.0/public",
        initialDoc: undefined,
        fullAPI: true,
      },
      pdfViewerRef.current
    )
      .then((instance) => {
        instanceRef.current = instance;
        if (pendingPdfUrlRef.current) {
          instance.UI.loadDocument(pendingPdfUrlRef.current);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage(`Failed to initialize PDF viewer. ${error.message || ""}`);
        setIsLoading(false);
      });
  }, [fileType]);

  const resetStateForNewFile = () => {
    setErrorMessage("");
    setDocs([]);
    setExcelSheets([]);
    setCurrentSheet(0);

    if (pendingPdfUrlRef.current) {
      URL.revokeObjectURL(pendingPdfUrlRef.current);
      pendingPdfUrlRef.current = null;
    }
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    resetStateForNewFile();

    const fileName = selectedFile.name.toLowerCase();

    try {
      if (fileName.endsWith(".pdf")) {
        setFileType("pdf");
        await handlePdfFile(selectedFile);
        return;
      }

      if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        setFileType("docx");
        const documentUrl = URL.createObjectURL(selectedFile);
        setDocs([{ uri: documentUrl, fileType: "docx", fileName: selectedFile.name }]);
        setIsLoading(false);
        return;
      }

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        setFileType("excel");
        await handleExcelFile(selectedFile);
        return;
      }

      setFileType(null);
      setErrorMessage("Unsupported file type. Please upload PDF, DOCX, or Excel files.");
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(`Error processing file: ${error.message || ""}`);
      setIsLoading(false);
    }
  };

  const handlePdfFile = async (selectedFile) => {
    const fileBuffer = await selectedFile.arrayBuffer();
    const pdfBlob = new Blob([fileBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    pendingPdfUrlRef.current = pdfUrl;

    if (instanceRef.current) {
      instanceRef.current.UI.loadDocument(pdfUrl);
      setIsLoading(false);
    }
  };

  const handleExcelFile = async (selectedFile) => {
    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);

      const sheets = [];
      workbook.eachSheet((worksheet) => {
        const rows = [];
        worksheet.eachRow((row) => {
          rows.push((row.values || []).slice(1));
        });
        sheets.push({ name: worksheet.name, data: rows });
      });

      setExcelSheets(sheets);
      setCurrentSheet(0);
    } catch (error) {
      setErrorMessage(`Failed to load Excel file. ${error.message || ""}`);
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-white/70 text-center mb-6">
            View PDF, Word documents, and Excel spreadsheets directly in your browser
          </p>

          <label className="block w-full p-4 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
            <span className="text-white/80">Choose a file (PDF, DOCX, XLS, XLSX)</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-sm text-white/70">
                Selected: <span className="font-semibold">{file.name}</span>
              </p>
              <p className="text-xs text-white/50 mt-1">Type: {fileType?.toUpperCase()}</p>
            </div>
          )}

          {errorMessage && (
            <div className="text-red-400 mt-4 p-3 bg-red-400/10 rounded-lg text-sm">{errorMessage}</div>
          )}
        </div>

        {isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
            <p className="text-green-400 font-semibold">Loading document...</p>
          </div>
        )}

        {fileType === "pdf" && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h3 className="text-lg font-semibold mb-4">PDF Viewer</h3>
            <div
              ref={pdfViewerRef}
              className="bg-black/50 rounded-lg overflow-hidden"
              style={{ height: "650px", width: "100%" }}
            />
          </div>
        )}

        {fileType === "docx" && docs.length > 0 && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <h3 className="text-lg font-semibold mb-4">Document Viewer</h3>
            <div className="bg-white text-black rounded-lg overflow-hidden max-h-[600px]">
              <DocViewer
                documents={docs}
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: {
                    disableHeader: false,
                    disableFileName: false,
                  },
                }}
              />
            </div>
          </div>
        )}

        {fileType === "excel" && excelSheets.length > 0 && !isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-semibold">Excel Spreadsheet</h3>
              {excelSheets.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {excelSheets.map((sheet, index) => (
                    <button
                      key={sheet.name}
                      onClick={() => setCurrentSheet(index)}
                      className={`px-4 py-2 rounded text-sm transition font-semibold ${
                        currentSheet === index
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
                  {excelSheets[currentSheet]?.data?.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border-b border-white/10 ${
                        rowIndex === 0 ? "bg-blue-600/30" : "hover:bg-white/5"
                      }`}
                    >
                      <td className="px-3 py-2 border-r border-white/10 text-white/70 min-w-[50px] text-right bg-black/40 font-semibold sticky left-0">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-4 py-2 border-r border-white/10 min-w-[100px] ${
                            rowIndex === 0 ? "text-white font-bold bg-blue-600/20" : "text-white/90"
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
