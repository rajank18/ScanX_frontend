import UnifiedDropzone from "./ui/UnifiedDropzone";

export default function ImageUpload({ onImageSelect }) {
  const handleSelect = (files) => {
    if (typeof onImageSelect === "function") {
      if (Array.isArray(files)) {
        onImageSelect(files[0]);
      } else {
        onImageSelect(files);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <UnifiedDropzone
        onFileSelect={handleSelect}
        accept="image/*"
        multiple={true}
        title="Choose Image or Take Photo"
        subtitle="Click to browse or drag & drop images"
        iconType="image"
      />
    </div>
  );
}
