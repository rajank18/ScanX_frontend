export default function ScanPreview({ scannedBlobUrl, format }) {
    if (!scannedBlobUrl) return null;
  
    const isPdf = format === "pdf";
    const downloadName = isPdf ? "scanned.pdf" : "scanned.png";
  
    return (
      <div className="flex flex-col items-center p-4">
        <h2 className="text-lg font-semibold mb-2">Scanned {isPdf ? "PDF" : "Image"}</h2>
        {!isPdf ? (
          <img src={scannedBlobUrl} alt="scanned" className="w-64 h-auto rounded-md shadow-md mb-2" />
        ) : (
          <iframe
            title="scanned-pdf"
            src={scannedBlobUrl}
            className="w-64 h-80 rounded-md shadow-md mb-2 bg-black"
          />
        )}
        <a
          href={scannedBlobUrl}
          download={downloadName}
          className="px-4 py-2 bg-black text-gray-100 rounded-md"
        >
          Download {isPdf ? "PDF" : "PNG"}
        </a>
      </div>
    );
  }
  