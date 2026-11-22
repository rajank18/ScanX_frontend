import { useState } from "react";
import SEO from "@/components/SEO";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";
import PageInfoSection from "@/components/PageInfoSection";
import { apiFetch, buildApiUrl } from "@/lib/api";
import {
  ShieldCheck,
  EyeSlash,
  DownloadSimple,
  CheckCircle,
  WarningCircle,
  SpinnerGap,
  Sparkle,
  FilePdf,
  Image as ImageIcon,
} from "@phosphor-icons/react";

export default function Redact() {
  const [file, setFile] = useState(null);
  const [redactAadhaar, setRedactAadhaar] = useState(true);
  const [redactPan, setRedactPan] = useState(true);
  const [redactEmail, setRedactEmail] = useState(true);
  const [redactPhone, setRedactPhone] = useState(true);
  const [customKeywords, setCustomKeywords] = useState("");
  const [redactionMode, setRedactionMode] = useState("blackout"); // 'blackout' | 'mask'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    setResult(null);
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("redactAadhaar", redactAadhaar);
      formData.append("redactPan", redactPan);
      formData.append("redactEmail", redactEmail);
      formData.append("redactPhone", redactPhone);
      formData.append("customKeywords", customKeywords);
      formData.append("redactionMode", redactionMode);

      const response = await apiFetch("/redact/process", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to redact document.");
      }
      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred while redacting sensitive information.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!result?.downloadUrl) return;
    try {
      const fullUrl = buildApiUrl(result.downloadUrl);
      const res = await fetch(fullUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = result.filename || "redacted-document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      window.location.href = buildApiUrl(result.downloadUrl);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <SEO
        title="Smart PII Redactor & Privacy Masker - ScanX"
        description="Auto-detect and redact Aadhaar numbers, PAN cards, email addresses, phone numbers, and custom keywords from PDFs and images."
        keywords="redact pdf, redact aadhaar, redact pan card, privacy masker, pii redaction, sanitize document"
        canonical="/redact"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck size={14} weight="duotone" />
            <span>Zero-Retention Privacy Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Smart PII Redactor & Privacy Masker
          </h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base max-w-xl mx-auto">
            Automatically detect and black out sensitive personal data (Aadhaar, PAN, phone, email, and custom phrases) before sharing documents.
          </p>
        </div>

        {!result ? (
          <div className="space-y-6">
            <UnifiedDropzone
              id="redact-dropzone"
              title="Upload PDF or Document Image to Redact"
              subtitle="Supports PDF, JPG, PNG, WebP up to 50MB"
              accept=".pdf,image/png,image/jpeg,image/webp"
              iconType="file"
              onFileSelect={handleFileSelect}
            />

            {file && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  {file.name.endsWith(".pdf") ? (
                    <FilePdf size={28} className="text-red-400 shrink-0" weight="duotone" />
                  ) : (
                    <ImageIcon size={28} className="text-emerald-400 shrink-0" weight="duotone" />
                  )}
                  <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-white/50">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="text-xs text-white/60 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            {/* PII Detection Rules Settings */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
              <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <EyeSlash size={18} className="text-emerald-400" weight="duotone" />
                Detection & Redaction Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redactAadhaar}
                    onChange={(e) => setRedactAadhaar(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">Aadhaar Card Numbers</div>
                    <div className="text-xs text-white/40">12-digit Indian national identity format</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redactPan}
                    onChange={(e) => setRedactPan(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">PAN Card Numbers</div>
                    <div className="text-xs text-white/40">10-character alphanumeric tax ID</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redactEmail}
                    onChange={(e) => setRedactEmail(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">Email Addresses</div>
                    <div className="text-xs text-white/40">Standard personal & business emails</div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redactPhone}
                    onChange={(e) => setRedactPhone(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">Phone Numbers</div>
                    <div className="text-xs text-white/40">10-digit mobile & international prefixes</div>
                  </div>
                </label>
              </div>

              {/* Custom Keywords Input */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Custom Keywords or Names to Black Out (comma separated)
                </label>
                <input
                  type="text"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  placeholder="e.g., John Doe, Secret Project, Roll Number 23DIT024"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Redaction Style Mode */}
              <div className="pt-2 flex items-center gap-4 text-xs">
                <span className="text-white/60">Redaction Style:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-white">
                  <input
                    type="radio"
                    name="redactionMode"
                    value="blackout"
                    checked={redactionMode === "blackout"}
                    onChange={(e) => setRedactionMode(e.target.value)}
                    className="accent-emerald-500"
                  />
                  Solid Blackout Box
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-white">
                  <input
                    type="radio"
                    name="redactionMode"
                    value="mask"
                    checked={redactionMode === "mask"}
                    onChange={(e) => setRedactionMode(e.target.value)}
                    className="accent-emerald-500"
                  />
                  Subtle Security Overlay
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                <WarningCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!file || isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <SpinnerGap size={18} className="animate-spin" />
                  <span>Scanning & Redacting Sensitive Data...</span>
                </>
              ) : (
                <>
                  <Sparkle size={18} weight="fill" />
                  <span>Redact & Sanitize Document</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Redaction Result View */
          <div className="p-6 rounded-2xl bg-black/80 border border-emerald-500/30 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CheckCircle size={36} weight="duotone" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Document Redacted Successfully!</h2>
              <p className="text-sm text-white/60 mt-1">{result.summary}</p>
            </div>

            {result.detections && result.detections.length > 0 && (
              <div className="max-w-md mx-auto p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  Detected & Redacted Entities ({result.detections.length})
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
                  {result.detections.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-white/80">{d.type}</span>
                      <span className="font-mono text-emerald-300">{d.masked}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={buildApiUrl(result.downloadUrl)}
                onClick={handleDownload}
                download={result.filename}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <DownloadSimple size={18} weight="bold" />
                <span>Download Redacted File</span>
              </a>
              <button
                onClick={reset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition cursor-pointer"
              >
                Redact Another File
              </button>
            </div>
          </div>
        )}

        <PageInfoSection
          aboutTitle="About Smart PII Redaction"
          aboutText="The Smart PII Redactor ensures student, academic, and business privacy by masking sensitive personally identifiable information (PII) before documents are distributed. Unlike basic text-replace tools, ScanX strips underlying metadata and paints opaque redaction bars over targeted coordinates."
          howItWorks={[
            "Upload your PDF or image document (Aadhaar, marksheet, ID card, invoice).",
            "Choose which sensitive identifiers to mask (Aadhaar, PAN, phone, email, or custom terms).",
            "Click Redact & Sanitize to produce a fully anonymized copy ready for safe sharing.",
          ]}
          faqs={[
            {
              question: "Can redacted data be recovered by someone selecting the text?",
              answer: "No. Redaction replaces or draws permanent opaque barriers over the content and strips corresponding metadata tags, ensuring data cannot be highlighted or recovered.",
            },
            {
              question: "Are my uploaded files permanently stored?",
              answer: "No. In accordance with ScanX zero-retention privacy, original files are deleted from the disk immediately after redaction.",
            },
          ]}
        />
      </div>
    </>
  );
}
