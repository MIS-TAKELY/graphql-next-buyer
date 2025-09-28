// components/review/MediaUploader.jsx
import { Label } from "@/components/ui/label";
import { Upload, Video, X } from "lucide-react";
import { useCallback, useState } from "react";

export const MediaUploader = ({ media = [], onMediaChange, onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFiles = useCallback(
    (files) => {
      const validFiles = Array.from(files).filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        return (isImage || isVideo) && isValidSize;
      });

      validFiles.forEach(async (file) => {
        const localUrl = URL.createObjectURL(file);
        const mediaItem = {
          id: Date.now() + Math.random().toString(36),
          url: localUrl,
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
          name: file.name,
          size: file.size,
        };

        onMediaChange([...media, mediaItem]);

        if (onUpload) {
          try {
            const uploadedUrl = await onUpload(file);
            onMediaChange(
              media.map((item) =>
                item.id === mediaItem.id ? { ...item, url: uploadedUrl } : item
              )
            );
            URL.revokeObjectURL(localUrl);
          } catch (error) {
            console.error("Upload failed:", error);
            onMediaChange(media.filter((item) => item.id !== mediaItem.id));
          }
        }
      });
    },
    [media, onMediaChange, onUpload]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeMedia = useCallback(
    (mediaId) => {
      onMediaChange(media.filter((item) => item.id !== mediaId));
    },
    [media, onMediaChange]
  );

  return (
    <div>
      <Label className="text-base font-medium">
        Add Photos or Videos (Optional)
      </Label>
      <div className="mt-2 space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Upload className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? "Drop files here" : "Upload media files"}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop images or videos, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPG, PNG, GIF, MP4, MOV (Max 10MB per file)
            </p>
          </div>
        </div>

        {/* Media Previews */}
        {media.length > 0 && (
          <MediaPreviewGrid
            media={media}
            onRemove={removeMedia}
            formatFileSize={formatFileSize}
          />
        )}
      </div>
    </div>
  );
};

const MediaPreviewGrid = ({ media, onRemove, formatFileSize }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-700 mb-3">
      Uploaded Files ({media.length})
    </h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {media.map((item) => (
        <MediaPreviewItem
          key={item.id}
          media={item}
          onRemove={onRemove}
          formatFileSize={formatFileSize}
        />
      ))}
    </div>
  </div>
);

const MediaPreviewItem = ({ media, onRemove, formatFileSize }) => (
  <div className="relative group">
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
      {media.type === "IMAGE" ? (
        <img
          src={media.url}
          alt={media.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
          <Video className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-xs text-gray-600 text-center px-2">
            {media.name}
          </span>
        </div>
      )}

      <button
        onClick={() => onRemove(media.id)}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs truncate">{media.name}</p>
        <p className="text-xs">{formatFileSize(media.size)}</p>
      </div>
    </div>
  </div>
);
