import { useState } from "react";
import SEO from "@/components/SEO";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";
import PageInfoSection from "@/components/PageInfoSection";
import {
  Eraser,
  ShieldCheck,
  Robot,
  Camera,
  DownloadSimple,
  CheckCircle,
  WarningCircle,
  SpinnerGap,
  Sparkle,
  FileText,
  Tag,
} from "@phosphor-icons/react";

export default function MetadataRemover() {
  const [file, setFile] = useState(null);
  const [inspectData, setInspectData] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isStripping, setIsStripping] = useState(false);
  const [stripResult, setStripResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    setError(null);
    setInspectData(null);
    setStripResult(null);
    if (!selectedFile) return;
    setFile(selectedFile);

    // Automatically inspect metadata on file drop
    setIsInspecting(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/metadata/inspect", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to inspect file metadata.");
      setInspectData(data);
    } catch (err) {
      console.warn("Inspect metadata error:", err);
      // Non-fatal, user can still proceed to strip
    } finally {
      setIsInspecting(false);
    }
  };

  const handleStrip = async () => {
    if (!file) return;
    setIsStripping(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/metadata/strip", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to strip file metadata.");
      }
      setStripResult(data);
    } catch (err) {
      setError(err.message || "An error occurred while stripping metadata.");
    } finally {
      setIsStripping(false);
    }
  };

  const reset = () => {
    setFile(null);
    setInspectData(null);
    setStripResult(null);
    setError(null);
  };

  return (
    <>
      <SEO
        title="Metadata & AI Tag Remover - ScanX"
        description="Strip camera EXIF, GPS location coordinates, author history, and Midjourney, DALL-E, and Stable Diffusion AI tags from PDFs and images."
        keywords="remove exif, remove ai tags, strip metadata, midjourney tag remover, stable diffusion parameters remover, pdf anonymizer"
        canonical="/metadata-remover"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Eraser size={14} weight="duotone" />
            <span>Anti-Forensics & AI Anonymizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Metadata & AI Tag Remover
          </h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base max-w-xl mx-auto">
            Purge hidden tracking metadata: camera EXIF, GPS coordinates, author computer username, and AI generator watermarks (Midjourney, DALL-E, Stable Diffusion).
          </p>
        </div>

        {!stripResult ? (
          <div className="space-y-6">
            <UnifiedDropzone
              id="metadata-dropzone"
              title="Upload PDF or Image to Anonymize"
              subtitle="Supports JPG, PNG, WebP, TIFF, and PDF documents"
              accept=".pdf,image/png,image/jpeg,image/webp,image/tiff"
              iconType="image"
              onFileSelect={handleFileSelect}
            />

            {file && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <FileText size={28} className="text-emerald-400 shrink-0" weight="duotone" />
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

            {/* Live Metadata Inspection Card */}
            {isInspecting ? (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center gap-2 text-xs text-white/60">
                <SpinnerGap size={16} className="animate-spin text-emerald-400" />
                <span>Inspecting hidden EXIF tags, GPS, and AI generation parameters...</span>
              </div>
            ) : inspectData ? (
              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Tag size={18} className="text-emerald-400" weight="duotone" />
                    <span>Inspection Report ({inspectData.tagCount} Hidden Tags Detected)</span>
                  </h2>
                  {inspectData.isAiGenerated && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1">
                      <Robot size={14} weight="duotone" />
                      <span>AI Generated Markers</span>
                    </span>
                  )}
                </div>

                {inspectData.aiIndicators && inspectData.aiIndicators.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Robot size={15} />
                      <span>AI Model Provenance Detected:</span>
                    </div>
                    {inspectData.aiIndicators.map((ai, i) => (
                      <div key={i} className="text-xs text-white/80 pl-5">
                        <strong className="text-white">{ai.tool}:</strong> {ai.detail}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(inspectData.tags).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <span className="text-white/60">{key}</span>
                      <span className="text-white font-mono truncate max-w-[150px]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                <WarningCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleStrip}
              disabled={!file || isStripping}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isStripping ? (
                <>
                  <SpinnerGap size={18} className="animate-spin" />
                  <span>Purging All EXIF, GPS & AI Parameters...</span>
                </>
              ) : (
                <>
                  <Sparkle size={18} weight="fill" />
                  <span>Strip All Metadata & Anonymize File</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Result View */
          <div className="p-6 sm:p-8 rounded-2xl bg-black/80 border border-emerald-500/30 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle size={36} weight="duotone" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                100% Anonymized & Clean
              </span>
              <h2 className="text-xl font-bold text-white">Metadata & AI Watermarks Stripped!</h2>
              <p className="text-xs text-white/60 mt-1">{stripResult.summary}</p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                Purged Hidden Data Layers
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stripResult.strippedTags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/80"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`http://localhost:5000${stripResult.downloadUrl}`}
                download={stripResult.filename}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                <DownloadSimple size={18} weight="bold" />
                <span>Download Anonymized File</span>
              </a>
              <button
                onClick={reset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition cursor-pointer"
              >
                Clean Another File
              </button>
            </div>
          </div>
        )}

        <PageInfoSection
          aboutTitle="About Metadata & AI Tag Removal"
          aboutText="Digital cameras, smartphones, office software, and generative AI tools embed hidden metadata into files without user awareness. ScanX provides a rigorous anti-forensic sanitizer that wipes EXIF data, GPS coordinates, author computer identities, and AI generation watermarks (such as Midjourney prompts and Stable Diffusion seeds) to ensure complete privacy."
          howItWorks={[
            "Upload any image (JPG, PNG, WebP) or PDF document.",
            "ScanX instantly inspects and displays hidden device, GPS, and AI generation parameters.",
            "Click Strip Metadata to generate an identical visual file completely scrubbed of hidden binary tags.",
          ]}
          faqs={[
            {
              question: "Does removing metadata reduce image or document visual quality?",
              answer: "No. The visual pixels and textual content remain pristine; only the hidden binary EXIF, XMP, and comment chunks are wiped.",
            },
            {
              question: "Can Midjourney or Stable Diffusion prompts still be read from the image?",
              answer: "No. The raw text chunks containing generation parameters (prompt, seed, steps, model) are completely purged.",
            },
          ]}
        />
      </div>
    </>
  );
}
