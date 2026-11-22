import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";
import PageInfoSection from "@/components/PageInfoSection";
import {
  ShareNetwork,
  CloudArrowUp,
  DownloadSimple,
  Check,
  Copy,
  Clock,
  File,
  WarningCircle,
  SpinnerGap,
  Sparkle,
} from "@phosphor-icons/react";

export default function FileShare() {
  const { shareId } = useParams();

  // Uploader State
  const [file, setFile] = useState(null);
  const [expiryHours, setExpiryHours] = useState(24);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Recipient / Download State (when visited via /share/:shareId)
  const [recipientFile, setRecipientFile] = useState(null);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(Boolean(shareId));
  const [recipientError, setRecipientError] = useState(null);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  useEffect(() => {
    if (!shareId) return;

    let isMounted = true;
    const fetchFileInfo = async () => {
      setIsLoadingRecipient(true);
      setRecipientError(null);
      try {
        const res = await fetch(`http://localhost:5000/share/info/${shareId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "File not found or expired.");
        }
        if (isMounted) {
          setRecipientFile(data);

          // Automatically trigger download with zero hassle
          setTimeout(() => {
            const downloadUrl = `http://localhost:5000/share/download/${shareId}`;
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = data.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloadTriggered(true);
          }, 800);
        }
      } catch (err) {
        if (isMounted) {
          setRecipientError(err.message);
        }
      } finally {
        if (isMounted) setIsLoadingRecipient(false);
      }
    };

    fetchFileInfo();
    return () => {
      isMounted = false;
    };
  }, [shareId]);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File exceeds 100MB limit. Please select a smaller file.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("expiryHours", expiryHours);

    try {
      setUploadProgress(50);
      const res = await fetch("http://localhost:5000/share/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create share link.");
      }

      setUploadProgress(100);
      setShareData(data);
    } catch (err) {
      setError(err.message || "An error occurred while uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareData) return;
    const shareableUrl = `${window.location.origin}/share/${shareData.shareId}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetUploader = () => {
    setFile(null);
    setShareData(null);
    setError(null);
    setUploadProgress(0);
  };

  // -------------------------------------------------------------
  // RECIPIENT VIEW (When opening a shared URL /share/:shareId)
  // -------------------------------------------------------------
  if (shareId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <SEO
          title="Direct File Download - ScanX"
          description="Download your shared file directly with zero password or OTP hassle."
          canonical={`/share/${shareId}`}
        />

        {isLoadingRecipient ? (
          <div className="p-8 rounded-2xl bg-black/60 border border-white/10 space-y-4">
            <SpinnerGap size={40} className="animate-spin text-emerald-400 mx-auto" />
            <h2 className="text-lg font-semibold text-white">Preparing your instant download...</h2>
            <p className="text-xs text-white/50">Fetching file stream without passwords or OTPs.</p>
          </div>
        ) : recipientError ? (
          <div className="p-8 rounded-2xl bg-black/80 border border-red-500/30 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
              <WarningCircle size={32} weight="duotone" />
            </div>
            <h2 className="text-lg font-bold text-white">Share Link Unavailable</h2>
            <p className="text-sm text-white/60">{recipientError}</p>
            <Link
              to="/share"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
            >
              Upload Your Own File to Share
            </Link>
          </div>
        ) : recipientFile ? (
          <div className="p-8 rounded-2xl bg-black/80 border border-emerald-500/30 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CloudArrowUp size={36} weight="duotone" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                ScanX Instant File Delivery
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white break-all">{recipientFile.originalName}</h1>
              <p className="text-xs text-white/50 mt-1">
                {(recipientFile.size / (1024 * 1024)).toFixed(2)} MB • No Login • Zero Tracking
              </p>
            </div>

            {downloadTriggered && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center gap-2">
                <Check size={16} weight="bold" />
                <span>Download started automatically! If it didn't begin, click below:</span>
              </div>
            )}

            <div className="space-y-3">
              <a
                href={`http://localhost:5000/share/download/${shareId}`}
                download={recipientFile.originalName}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                <DownloadSimple size={20} weight="bold" />
                <span>Download File ({(recipientFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </a>

              <p className="text-[11px] text-white/40 flex items-center justify-center gap-1">
                <Clock size={13} />
                <span>Expires on {new Date(recipientFile.expiresAt).toLocaleDateString()} at {new Date(recipientFile.expiresAt).toLocaleTimeString()}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link to="/share" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                Want to send a large file without size limits? Click here →
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // -------------------------------------------------------------
  // UPLOADER VIEW (/share)
  // -------------------------------------------------------------
  const fullShareUrl = shareData ? `${window.location.origin}/share/${shareData.shareId}` : "";

  return (
    <>
      <SEO
        title="Zero-Hassle File Sharer (100MB Limit) - ScanX"
        description="Share files up to 100MB with a direct instant download link. No accounts, passwords, or OTPs required."
        keywords="file sharing, direct download link, quick file share, send large files, zero otp file share"
        canonical="/share"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <ShareNetwork size={14} weight="duotone" />
            <span>100MB Limit • Frictionless Direct Sharing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Zero-Hassle File Sharer
          </h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base max-w-xl mx-auto">
            Upload any document, PDF, archive, or media up to 100MB and get an instant shareable URL. The recipient clicks and the file downloads immediately — no passwords, OTPs, or signups.
          </p>
        </div>

        {!shareData ? (
          <div className="space-y-6">
            <UnifiedDropzone
              id="fileshare-dropzone"
              title="Drag & Drop Any File up to 100MB"
              subtitle="Supports all formats: PDF, ZIP, DOCX, Images, Video, Audio"
              iconType="upload"
              onFileSelect={handleFileSelect}
            />

            {file && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <File size={28} className="text-emerald-400 shrink-0" weight="duotone" />
                  <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-white/50">{(file.size / (1024 * 1024)).toFixed(2)} MB / 100 MB</p>
                  </div>
                </div>
                <button
                  onClick={resetUploader}
                  className="text-xs text-white/60 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            {/* Expiry Selector */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-emerald-400" weight="duotone" />
                <span className="text-white font-medium">Link Expiration:</span>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: "1 Hour", val: 1 },
                  { label: "24 Hours (Default)", val: 24 },
                  { label: "7 Days", val: 168 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setExpiryHours(opt.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      expiryHours === opt.val
                        ? "bg-emerald-500 text-black font-semibold shadow"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                <WarningCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <SpinnerGap size={18} className="animate-spin" />
                  <span>Uploading & Generating Link ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkle size={18} weight="fill" />
                  <span>Generate Instant Share Link</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Share Link Result View */
          <div className="p-6 sm:p-8 rounded-2xl bg-black/80 border border-emerald-500/30 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShareNetwork size={36} weight="duotone" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Your Shareable Link is Ready!</h2>
              <p className="text-xs text-white/60 mt-1">
                Anyone who opens this link can download the file immediately with zero prompts.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={fullShareUrl}
                className="w-full bg-transparent text-emerald-300 text-xs font-mono truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition cursor-pointer"
              >
                {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-white/50">
              <span>Size: {(shareData.size / (1024 * 1024)).toFixed(2)} MB</span>
              <span>•</span>
              <span>Expires: {new Date(shareData.expiresAt).toLocaleDateString()}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`http://localhost:5000${shareData.downloadUrl}`}
                download={shareData.originalName}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                <DownloadSimple size={18} weight="bold" />
                <span>Test Direct Download</span>
              </a>
              <button
                onClick={resetUploader}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition cursor-pointer"
              >
                Share Another File
              </button>
            </div>
          </div>
        )}

        <PageInfoSection
          aboutTitle="About Zero-Hassle File Sharing"
          aboutText="Unlike services such as WeTransfer or Google Drive that require permissions, email verification, or full accounts, ScanX File Sharer offers pure frictionless file sharing. Files up to 100MB generate an ephemeral one-click download URL."
          howItWorks={[
            "Drop your document, archive, or media file (up to 100MB).",
            "Select how long the link should stay alive (1 hour, 24 hours, or 7 days).",
            "Copy the shareable URL and send it to your recipient for instant, zero-prompt downloading.",
          ]}
          faqs={[
            {
              question: "Does the recipient need a ScanX account or password?",
              answer: "No. The recipient simply visits the link and the browser automatically initiates the download directly.",
            },
            {
              question: "What happens when the link expires?",
              answer: "The file is permanently purged from disk to ensure storage efficiency and data privacy.",
            },
          ]}
        />
      </div>
    </>
  );
}
