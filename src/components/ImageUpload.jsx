import { useState } from "react";

export default function ImageUpload({ onImageSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      setPreview(URL.createObjectURL(files[0]));
      onImageSelect(files);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
      <label className="block w-full mb-4 p-2 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10">
        <span className="text-white/80">Choose Image or Take Photo</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {/* Removed large preview image */}
    </div>
  );
}
