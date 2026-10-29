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

      <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">Google Colab Link to PDF</h2>
        <p className="text-white/70 mb-6 text-sm">
          Paste your shared Google Colab link or upload an <code className="text-blue-400">.ipynb</code> / <code className="text-blue-400">.py</code> file to generate a submission-ready PDF.
        </p>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab("link"); setErrorMessage(""); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === "link"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            Paste Colab / GitHub Link
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("upload"); setErrorMessage(""); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === "upload"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            Upload .ipynb / .py File
          </button>
        </div>

        {/* Link Input Mode */}
        {activeTab === "link" && (
          <form onSubmit={handleConvert} className="mb-4 text-left">
            <label htmlFor="colab-url" className="block text-xs font-medium text-white/70 mb-2">
              Google Colab / Drive / GitHub Notebook Link
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="colab-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://colab.research.google.com/drive/... or GitHub URL"
                className="flex-1 px-4 py-2.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 text-sm"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="px-3 py-2 text-xs text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-white/5"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-white/50">
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Colab Drive Link</span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Google Drive Share Link</span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">GitHub Colab Link</span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Raw .ipynb / .py</span>
            </div>
          </form>
        )}

        {/* Upload File Mode */}
        {activeTab === "upload" && (
          <div className="mb-4">
            <label className="block w-full p-6 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10 transition">
              <span className="text-white/80 font-medium">Choose .ipynb or .py File</span>
              <p className="text-xs text-white/50 mt-1">Select a downloaded Jupyter Notebook or Python script</p>
              <input
                type="file"
                accept=".ipynb,.py,application/x-ipynb+json,text/x-python"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {file && (
              <div className="mt-3 p-3 bg-white/10 rounded-lg text-left">
                <p className="text-sm text-white/80">Selected: <span className="font-semibold text-white">{file.name}</span></p>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="text-red-400 mb-4 p-3 bg-red-400/10 border border-red-500/20 rounded-lg text-sm text-left">
            {errorMessage}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleConvert}
          disabled={isLoading || (activeTab === "link" ? !url.trim() : !file)}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold mb-4 transition text-sm sm:text-base"
        >
          {isLoading ? "Fetching & Generating PDF..." : "Convert to PDF"}
        </button>

        {/* Result Area */}
        {pdfBlobUrl && (
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-sm font-semibold text-green-400 flex items-center gap-1.5">
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
                className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-semibold text-center"
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
