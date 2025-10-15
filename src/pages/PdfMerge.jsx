import { useState } from "react";
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
          <a href={getPreviewUrl(file)} target="_blank" rel="noopener noreferrer" className="text-blue-400 p-1 text-xs flex items-center justify-center" title="Preview">👁</a>
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

  // PDF preview logic (first page as image)
  // NOTE: This is a placeholder. For real preview, use pdfjs-dist or similar library.
  const getPreviewUrl = (file) => {
    // For now, just return a blob URL for download, not a real preview
    return URL.createObjectURL(file);
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
      const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      const res = await fetch(`${baseUrl}/merge/merge`, {
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
    <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Merge PDFs</h2>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        className="mb-4 block mx-auto"
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
          className="w-full px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-60 mb-2"
        >
          {isMerging ? "Merging..." : "Merge PDFs"}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {mergedPdfUrl && (
        <a
          href={mergedPdfUrl}
          download="merged.pdf"
          className="px-4 py-2 bg-black text-gray-100 rounded-md mt-4 inline-block"
        >
          Download Merged PDF
        </a>
      )}
      <p className="mt-2 text-white/70">Select multiple PDF files, reorder them, and merge into one.</p>
    </div>
  );
}




