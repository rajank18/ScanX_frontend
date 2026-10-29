import { useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import SEO from "@/components/SEO";
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
import { PDFDocument } from "pdf-lib";

export default function ImageToPdf() {
  const [images, setImages] = useState([]);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageSelect = (filesOrFile) => {
    const normalizedFiles = Array.isArray(filesOrFile) ? filesOrFile : [filesOrFile];
    setImages((prev) => [...prev, ...normalizedFiles.filter(Boolean)]);
  };

  const handleConvert = async () => {
    if (!images.length) return;
    try {
      setIsLoading(true);
      setErrorMessage("");

      const pdfDoc = await PDFDocument.create();

      for (const imageFile of images) {
        const bytes = await imageFile.arrayBuffer();
        const isPng = imageFile.type === "image/png" || imageFile.name.toLowerCase().endsWith(".png");
        let embeddedImage;
        try {
          embeddedImage = isPng
            ? await pdfDoc.embedPng(bytes)
            : await pdfDoc.embedJpg(bytes);
        } catch {
          // Fallback: convert any image type (WebP, AVIF, BMP, GIF, etc.) via canvas to clean PNG
          const imgBitmap = await createImageBitmap(imageFile);
          const canvas = document.createElement("canvas");
          canvas.width = imgBitmap.width;
          canvas.height = imgBitmap.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(imgBitmap, 0, 0);
          const cleanBlob = await new Promise((res) => canvas.toBlob(res, "image/png"));
          const cleanBytes = await cleanBlob.arrayBuffer();
          embeddedImage = await pdfDoc.embedPng(cleanBytes);
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
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
        className={`bg-gray-800 px-2 py-2 rounded-xl shadow-md relative ${isDragging ? 'ring-2 ring-emerald-500' : ''}`}
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
          className="cursor-move text-emerald-400 absolute top-2 right-2 text-lg"
          title="Drag"
          {...listeners}
        >↔</span>
      </li>
    );
  }

  return (
    <>
      <SEO 
        title="Free Image to PDF Converter - Convert JPG, PNG to PDF Online"
        description="Convert images to PDF online for free. Upload multiple images (JPG, PNG, JPEG) and combine them into a single PDF file. Drag and reorder images easily."
        keywords="image to pdf, jpg to pdf, png to pdf, convert images to pdf, pictures to pdf, photos to pdf, online image converter"
        canonical="/convertor/image-to-pdf"
      />
      <div className="w-full max-w-2xl mx-auto text-gray-100 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0d1614]/90 text-center shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Image to PDF</h2>
        <p className="text-white/60 mb-6 text-sm">Upload one or more images (any format) to convert them into a single PDF file. Drag to reorder.</p>
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
              className="w-full py-3 px-6 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 font-semibold shadow-lg transition text-sm sm:text-base"
            >
              {isLoading ? "Converting..." : "Convert to PDF"}
            </button>
          </div>
        )}
        {errorMessage && <p className="mt-2 text-sm text-red-400">{errorMessage}</p>}
        {pdfBlobUrl && (
          <div className="flex flex-col items-center p-4 mt-6">
            <h2 className="text-lg font-semibold mb-2">PDF Ready</h2>
            <a
              href={pdfBlobUrl}
              download="converted.pdf"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition font-semibold shadow-md inline-block text-sm sm:text-base"
            >
              Download PDF
            </a>
          </div>
        )}
      </div>
    </>
  );
}
