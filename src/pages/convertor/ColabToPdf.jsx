import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { apiFetch } from "@/lib/api";
import PageInfoSection from "@/components/PageInfoSection";

export default function ColabToPdf() {
  const [activeTab, setActiveTab] = useState("link"); // "link" | "upload"
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfFilename, setPdfFilename] = useState("notebook.pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPdfBlobUrl(null);
      setErrorMessage("");
    }
  };

  const handleConvert = async (e) => {
    if (e) e.preventDefault();

    if (activeTab === "link" && !url.trim()) {
      setErrorMessage("Please enter a Google Colab or GitHub notebook URL.");
      return;
    }

    if (activeTab === "upload" && !file) {
      setErrorMessage("Please select an .ipynb or .py file to convert.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      let res;
      if (activeTab === "link") {
        res = await apiFetch("/convert/colab-to-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", file);
        res = await apiFetch("/convert/colab-to-pdf", {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        let errorMsg = `Conversion failed (HTTP ${res.status})`;
        try {
          const json = await res.json();
          if (json && json.error) errorMsg = json.error;
        } catch {
          const text = await res.text();
          if (text) errorMsg = text;
        }
        throw new Error(errorMsg);
      }

      // Determine downloaded filename from header or input
      const disposition = res.headers.get("Content-Disposition");
      let filename = "notebook.pdf";
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      } else if (file) {
        filename = `${file.name.replace(/\.[^/.]+$/, "")}.pdf`;
      } else if (url) {
        const clean = url.split("?")[0];
        const last = clean.split("/").pop();
        if (last) filename = `${last.replace(/\.[^/.]+$/, "")}.pdf`;
      }

      setPdfFilename(filename);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to convert notebook to PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Google Colab Link to PDF - Convert Colab Links & Notebooks Online"
        description="Convert Google Colab share links and Jupyter .ipynb notebooks directly into clean, styled PDFs with syntax highlighted code and markdown. Free, instant, and mobile-friendly."
        keywords="colab link to pdf, google colab link to pdf, convert colab link to pdf, google colab to pdf, colab to pdf, ipynb to pdf, colab pdf export, scanx converter"
        canonical="/colab-to-pdf"
      />

      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/15 bg-black/60 text-center shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Google Colab Link to PDF</h2>
        <p className="text-white/60 mb-6 text-sm">
          Convert Google Colab notebooks or .ipynb files into clean, styled PDFs.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 mb-6 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => { setActiveTab("link"); setErrorMessage(""); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "link"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Paste Link
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("upload"); setErrorMessage(""); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "upload"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Link Input Mode */}
        {activeTab === "link" && (
          <form onSubmit={handleConvert} className="mb-6">
            <input
              id="colab-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://colab.research.google.com/drive/... or GitHub URL"
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
            />
          </form>
        )}

        {/* Upload File Mode */}
        {activeTab === "upload" && (
          <div className="mb-6">
            <label className="block w-full p-6 border border-dashed border-white/25 hover:border-emerald-500/60 rounded-xl text-center cursor-pointer hover:bg-white/[0.02] transition">
              <span className="text-white/90 font-medium block">Choose .ipynb or .py File</span>
              <p className="text-xs text-white/50 mt-1">Select a Jupyter Notebook or Python file</p>
              <input
                type="file"
                accept=".ipynb,.py,application/x-ipynb+json,text/x-python"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file && (
                <div className="mt-3 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg inline-block">
                  <span className="text-xs font-semibold text-emerald-300">Selected: {file.name}</span>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="text-red-400 mb-4 p-3 bg-red-400/10 border border-red-500/20 rounded-xl text-sm text-left">
            {errorMessage}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleConvert}
          disabled={isLoading || (activeTab === "link" ? !url.trim() : !file)}
          className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
        >
          {isLoading ? "Generating PDF..." : "Convert to PDF"}
        </button>

        {/* Result Area */}
        {pdfBlobUrl && (
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <span>✓</span> Conversion Successful
              </p>
              <p className="text-xs text-white/60 mt-0.5">{pdfFilename}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-xs font-medium text-center"
              >
                Preview
              </a>
              <a
                href={pdfBlobUrl}
                download={pdfFilename}
                className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition text-xs font-semibold text-center"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}
      </div>

      <PageInfoSection
        aboutTitle="About Google Colab to PDF"
        aboutText="Google Colab to PDF converts shared Google Colab notebook links, GitHub Jupyter notebooks, and local .ipynb/.py files into clean, beautifully formatted PDF documents. It preserves markdown explanations, code blocks, execution order, terminal outputs, and data visualizations without requiring LaTeX or nbconvert installation."
        howItWorks={[
          "Paste your Google Colab share link or upload an .ipynb/.py file.",
          "Ensure Google Drive links are set to 'Anyone with the link can view'.",
          "Click 'Convert to PDF' and download your formatted PDF document.",
        ]}
        faqs={[
          {
            question: "How do I share a Google Colab notebook link?",
            answer: "In Google Colab, click the 'Share' button in the top-right corner, change General Access to 'Anyone with the link can view', click 'Copy link', and paste it here.",
          },
          {
            question: "Does this include charts and plot outputs?",
            answer: "Yes, generated plots and charts (from matplotlib, seaborn, etc.) embedded in the notebook are included in the PDF.",
          },
          {
            question: "Can I convert local .ipynb or .py files from my computer?",
            answer: "Yes, switch to the 'Upload .ipynb / .py File' tab to convert files directly from your computer.",
          },
          {
            question: "Is my code secure and private?",
            answer: "Yes, files and links are processed securely in memory and temporary files are automatically cleaned up immediately.",
          },
        ]}
      />
    </>
  );
}
