import { useState } from "react";
import ImageUpload from "../../components/ImageUpload";
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

export default function ImageToPdf() {
  const [images, setImages] = useState([]);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageSelect = (files) => {
    setImages((prev) => [...prev, ...files]);
  };

  const handleConvert = async () => {
    if (!images.length) return;
    const formData = new FormData();
    images.forEach((img, idx) => formData.append("images", img));
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    try {
      setIsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${baseUrl}/convert/image-to-pdf`, { method: "POST", body: formData });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to convert");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // dnd-kit drag end handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((_, i) => i.toString() === active.id);
      const newIndex = images.findIndex((_, i) => i.toString() === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  // Sortable image card component
  function SortableImageCard({ img, idx, onRemove }) {
    const id = idx.toString();
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id });
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
        className={`bg-gray-800 px-2 py-2 rounded-xl shadow-md relative ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
        {...attributes}
      >
        <img src={URL.createObjectURL(img)} alt={`preview-${idx}`} className="w-24 h-32 object-contain rounded-md shadow-md mb-1" />
        <span className="truncate text-xs text-gray-200 mb-1 w-full text-center">{img.name || `Image ${idx + 1}`}</span>
        <div className="flex flex-row gap-1 w-full justify-center items-center mt-1">
          <button
            onClick={() => onRemove(idx)}
            className="text-red-400 hover:text-red-600 p-1 text-xs cursor-pointer flex items-center justify-center"
            title="Remove"
            style={{background: 'none', border: 'none'}}
          >✖</button>
        </div>
        <span
          className="cursor-move text-blue-400 absolute top-2 right-2 text-lg"
          title="Drag"
          {...listeners}
        >↔</span>
      </li>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto text-gray-100 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Image to PDF</h2>
      <p className="text-white/70 mb-6">Upload one or more images (any format) to convert them into a single PDF file. Drag to reorder.</p>
  <ImageUpload onImageSelect={handleImageSelect} />
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((_, i) => i.toString())}
            strategy={horizontalListSortingStrategy}
          >
            <ul className="mb-4 flex flex-row gap-3 items-center overflow-x-auto" style={{paddingBottom: '8px'}}>
              {images.map((img, idx) => (
                <SortableImageCard key={idx} img={img} idx={idx} onRemove={handleRemoveImage} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      {images.length > 0 && (
        <div className="flex flex-col gap-4 items-center mt-6">
          <button
            onClick={handleConvert}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-60"
          >
            {isLoading ? "Converting..." : "Convert to PDF"}
          </button>
        </div>
      )}
      {errorMessage && <p className="mt-2 text-sm text-red-400">{errorMessage}</p>}
      {pdfBlobUrl && (
        <div className="flex flex-col items-center p-4 mt-6">
          <h2 className="text-lg font-semibold mb-2">PDF Ready</h2>
          {/* <iframe src={pdfBlobUrl} title="PDF Preview" className="w-64 h-80 rounded-md shadow-md mb-2 bg-white" /> */}
          <a
            href={pdfBlobUrl}
            download="converted.pdf"
            className="px-4 py-2 bg-black text-gray-100 rounded-md"
          >
            Download PDF
          </a>
        </div>
      )}
      {!images.length && <p className="mt-2 text-white/70">Upload images to start conversion.</p>}
    </div>
  );
}
