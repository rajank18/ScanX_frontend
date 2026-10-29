import { useEffect, useRef, useState } from "react";
import SEO from "@/components/SEO";
import WebViewer from "@pdftron/webviewer";
import PageInfoSection from "@/components/PageInfoSection";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";

const SUPPORTED_EXTENSIONS = ["pdf", "docx", "doc", "xlsx", "xls"];

export default function UltimateViewer() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const viewerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const pendingDocumentUrlRef = useRef(null);
  const pendingExtensionRef = useRef(null);

  useEffect(() => {
    if (!file || !viewerRef.current || viewerInstanceRef.current) return;

    WebViewer(
      {
        path: "/webviewer",
        fullAPI: true,
      },
      viewerRef.current
    )
      .then((instance) => {
        viewerInstanceRef.current = instance;

        if (pendingDocumentUrlRef.current) {
          instance.UI
            .loadDocument(pendingDocumentUrlRef.current, {
              extension: pendingExtensionRef.current || undefined,
            })
            .then(() => setIsLoading(false))
            .catch((error) => {
              setErrorMessage(`Failed to load document in WebViewer. ${error.message || ""}`);
              setIsLoading(false);
            });
        }
      })
      .catch((error) => {
        setErrorMessage(`Failed to initialize WebViewer. ${error.message || ""}`);
        setIsLoading(false);
      });
  }, [file]);

  useEffect(() => {
    return () => {
      if (pendingDocumentUrlRef.current) {
        URL.revokeObjectURL(pendingDocumentUrlRef.current);
        pendingDocumentUrlRef.current = null;
      }
      pendingExtensionRef.current = null;
    };
  }, []);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setErrorMessage("");
    setIsLoading(true);

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";

    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      setFile(null);
      setErrorMessage("Unsupported file type. Please upload PDF, DOCX, DOC, XLSX, or XLS files.");
      setIsLoading(false);
      return;
    }

    setFile(selectedFile);

    if (pendingDocumentUrlRef.current) {
      URL.revokeObjectURL(pendingDocumentUrlRef.current);
      pendingDocumentUrlRef.current = null;
    }
    pendingExtensionRef.current = extension;

    const nextDocumentUrl = URL.createObjectURL(selectedFile);
    pendingDocumentUrlRef.current = nextDocumentUrl;

    try {
      if (viewerInstanceRef.current) {
        await viewerInstanceRef.current.UI.loadDocument(nextDocumentUrl, { extension });
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage(`Failed to load document in WebViewer. ${error.message || ""}`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Ultimate Document Viewer - View PDF, DOCX, Excel Online"
        description="View PDF, Word documents, and Excel files directly in your browser using WebViewer."
        keywords="document viewer, webviewer, pdf viewer, docx viewer, excel viewer"
        canonical="/viewer"
      />

      <div className="w-full max-w-2xl mx-auto text-gray-100 mb-6">
        <div className="backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Ultimate Document Viewer</h2>
          <p className="text-white/60 mb-6 text-sm">WebViewer powered preview for PDF, Word, and Excel files</p>

          <UnifiedDropzone
            onFileSelect={(selectedFile) => handleFileSelect({ target: { files: [selectedFile] } })}
            accept=".pdf,.docx,.doc,.xlsx,.xls"
            title="Choose a file (PDF, DOCX, DOC, XLSX, XLS)"
            subtitle="Drag & drop or click to preview in browser"
            iconType="file"
          />

          {file && (
            <div className="mt-4 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg inline-block">
              <p className="text-xs font-semibold text-emerald-300">
                Selected: {file.name}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="text-red-400 mt-4 p-3 bg-red-400/10 rounded-lg text-sm border border-red-500/20">{errorMessage}</div>
          )}
        </div>

        {isLoading && (
          <div className="backdrop-blur-md p-6 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center my-6 shadow-2xl">
            <p className="text-emerald-400 font-semibold animate-pulse">Loading document...</p>
          </div>
        )}

        {file && (
          <div className="backdrop-blur-md p-4 rounded-2xl border border-white/10 bg-[#0d1614]/90 shadow-2xl mt-6">
            <div
              ref={viewerRef}
              className="bg-black/60 rounded-xl overflow-hidden border border-white/10"
              style={{ height: "700px", width: "100%" }}
            />
          </div>
        )}

        <PageInfoSection
          aboutTitle="About Ultimate Viewer"
          aboutText="Ultimate Viewer lets you preview supported PDF, Word, and Excel files directly in your browser using WebViewer. It helps quickly inspect documents without downloading separate desktop apps."
          howItWorks={[
            "Upload a supported file like PDF, DOCX, or XLSX.",
            "WebViewer loads the document in an interactive preview area.",
            "Review content and upload another file anytime.",
          ]}
          faqs={[
            {
              question: "Which formats can I open?",
              answer: "You can open supported formats like PDF, DOCX/DOC, and XLSX/XLS in this viewer flow.",
            },
            {
              question: "Do I need to install software?",
              answer: "No, preview happens directly in your browser.",
            },
            {
              question: "Why did first-load errors happen earlier?",
              answer: "The viewer now passes extension metadata correctly on first load to prevent parser mismatch errors.",
            },
          ]}
        />
      </div>
    </>
  );
}
