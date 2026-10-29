import { useState } from "react";
import UnifiedDropzone from "@/components/ui/UnifiedDropzone";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SEO from "@/components/SEO";
import PageInfoSection from "@/components/PageInfoSection";
import { apiFetch } from "@/lib/api";

export default function PdfMerge() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setPdfFiles(Array.from(e.target.files));
    setMergedPdfUrl(null);
    setError("");
  };


  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // dnd-kit drag end handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = pdfFiles.findIndex(f => f.name + f.lastModified === active.id);
      const newIndex = pdfFiles.findIndex(f => f.name + f.lastModified === over.id);
      setPdfFiles(arrayMove(pdfFiles, oldIndex, newIndex));
    }
  };

  // Sortable PDF card component
  function SortablePdfCard({ file, idx, onRemove }) {
    const id = file.name + file.lastModified;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id });
    // Truncate name to 15 characters
    const shortName = file.name.length > 15 ? file.name.slice(0, 15) + '…' : file.name;
    return (
      <li
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          width: '140px',
          minWidth: '140px',
          maxWidth: '140px',
          opacity: isDragging ? 0.7 : 1,
          marginRight: '0px',
          marginLeft: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
        className={`bg-gray-800 px-2 py-2 rounded-xl shadow-md relative ${isDragging ? 'ring-2 ring-green-500' : ''}`}
        {...attributes}
      >
        <div className="w-24 h-32 bg-gray-900 rounded-md flex items-center justify-center mb-1 overflow-hidden">
          <span className="text-5xl text-gray-400">📄</span>
        </div>
        <span className="truncate text-xs text-gray-200 mb-1 w-full text-center">{shortName}</span>
        <div className="flex flex-row gap-1 w-full justify-center items-center mt-1">
          <button
            onClick={() => onRemove(idx)}
            className="text-red-400 hover:text-red-600 p-1 text-xs cursor-pointer flex items-center justify-center"
            title="Remove"
            style={{background: 'none', border: 'none'}}
          >✖</button>
          <button
            type="button"
            onClick={() => handlePreviewFile(file)}
            className="text-emerald-400 hover:text-emerald-300 p-1 text-xs flex items-center justify-center cursor-pointer"
            title="Preview PDF"
            style={{background: 'none', border: 'none'}}
          >👁</button>
        </div>
        <span
          className="cursor-move text-green-400 absolute top-2 right-2 text-lg"
          title="Drag"
          {...listeners}
        >↔</span>
      </li>
    );
  }

  // Remove a file
  const handleRemove = (idx) => {
    setPdfFiles(files => files.filter((_, i) => i !== idx));
  };

  // Safe PDF preview: opens a temporary URL on demand and frees memory after viewing
  const handlePreviewFile = (file) => {
    try {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Failed to preview PDF:', err);
    }
  };

  // Merge PDFs (to be connected to backend)
  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setError("Select at least 2 PDFs to merge.");
      return;
    }
    setIsMerging(true);
    setError("");
    try {
      const formData = new FormData();
      pdfFiles.forEach((file, idx) => {
        formData.append('pdfs', file, file.name);
      });
      const res = await apiFetch("/merge/merge", {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setMergedPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDFs");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <>
      <SEO 
        title="Free PDF Merger - Combine Multiple PDFs Online"
        description="Free online PDF merger tool. Combine and merge multiple PDF files into one. Drag, drop, reorder, and merge PDFs instantly in your browser. No registration required."
        keywords="merge pdf, combine pdf, pdf merger, join pdf, merge pdf files, combine pdf files, pdf combiner, scanx merge"
        canonical="/merge-pdf"
      />
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Merge PDFs</h2>
        <p className="text-white/60 mb-6 text-sm">Select multiple PDF files, reorder them, and merge into one.</p>

        <UnifiedDropzone
          onFileSelect={(files) => handleFileChange({ target: { files: Array.isArray(files) ? files : [files] } })}
          accept="application/pdf"
          multiple={true}
          title="Choose PDF Files"
          subtitle="Select two or more PDFs to combine and reorder"
          iconType="files"
          className="mb-6"
        />

        {pdfFiles.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pdfFiles.map(f => f.name + f.lastModified)}
              strategy={horizontalListSortingStrategy}
            >
              <ul className="mb-4 flex flex-row gap-3 items-center overflow-x-auto" style={{paddingBottom: '8px'}}>
                {pdfFiles.map((file, idx) => (
                  <SortablePdfCard key={file.name + file.lastModified} file={file} idx={idx} onRemove={handleRemove} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        {pdfFiles.length > 0 && (
          <button
            onClick={handleMerge}
            disabled={isMerging || pdfFiles.length < 2}
            className="w-full py-3 px-6 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-40 font-semibold mb-2 shadow-lg transition"
          >
            {isMerging ? "Merging..." : "Merge PDFs"}
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {mergedPdfUrl && (
          <a
            href={mergedPdfUrl}
            download="merged.pdf"
            className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 mt-4 inline-block shadow-md transition"
          >
            Download Merged PDF
          </a>
        )}
      </div>
      <PageInfoSection
        aboutTitle="About PDF Merger"
        aboutText="PDF Merger combines multiple PDF documents into one file. It helps organize reports, invoices, chapters, and scans in the exact order you choose using drag-and-drop reordering."
        howItWorks={[
          "Upload two or more PDF files.",
          "Drag cards to arrange the final page order.",
          "Merge files and download one combined PDF.",
        ]}
        faqs={[
          {
            question: "Can I reorder PDFs before merging?",
            answer: "Yes, drag and drop each file card into your preferred order before merging.",
          },
          {
            question: "How many PDFs can I merge?",
            answer: "You can merge multiple files as long as they are valid PDFs and manageable in your browser session.",
          },
          {
            question: "Will original files be changed?",
            answer: "No, merging creates a new output file while original source files remain unchanged.",
          },
        ]}
      />
    </>
  );
}




