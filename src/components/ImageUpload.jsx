import { useState } from "react";

export default function ImageUpload({ onImageSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
      <label className="block w-full mb-4 p-2 border border-dashed border-white/30 rounded-lg text-center cursor-pointer hover:bg-white/10">
        <span className="text-white/80">Choose Image or Take Photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {preview && (
        <img 
          src={preview} 
          alt="preview" 
          className="w-full max-w-full h-auto rounded-md shadow-md max-h-64 object-contain" 
        />
      )}
    </div>
  );
}
