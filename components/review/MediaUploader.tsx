import { uploadToCloudinary } from "@/servers/utils/uploadToCloudinary";
import { formatFileSize } from "@/utlis/dateHelpers";
import { Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  name: string;
  size: number;
  status?: "uploading" | "uploaded" | "error";
  publicId?: string;
};

export const MediaUploader = ({
  value,
  onChange,
  maxSizeMB = 10,
  onUploadingChange, // NEW: notify parent if any upload is in progress
}: {
  value: MediaItem[];
  onChange: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  maxSizeMB?: number;
  onUploadingChange?: (uploading: boolean) => void; // NEW
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // NEW: whenever the media list changes, tell parent if anything is uploading
  useEffect(() => {
    const uploading = value.some((m) => m.status === "uploading");
    onUploadingChange?.(uploading);
  }, [value, onUploadingChange]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const valid = Array.from(files).filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
        return (isImage || isVideo) && isValidSize;
      });

      valid.forEach(async (file) => {
        const localUrl = URL.createObjectURL(file);
        const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const mediaItem: MediaItem = {
          id,
          url: localUrl,
          type: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
          name: file.name,
          size: file.size,
          status: "uploading", // ensure we set uploading right away
        };

        // Add optimistically
        onChange((prev) => [...prev, mediaItem]);

        try {
          const resourceType = file.type.startsWith("image/") ? "image" : "video";
          const result = await uploadToCloudinary(file, resourceType);

          // Mark as uploaded and replace preview URL with Cloudinary URL
          onChange((prevValue) =>
            prevValue.map((item) =>
              item.id === mediaItem.id
                ? {
                    ...item,
                    url: result.url,
                    status: "uploaded",
                    publicId: result.publicId,
                    size: result.size ?? item.size,
                  }
                : item
            )
          );
        } catch (e) {
          console.error("Upload failed:", e);
          // Option A: mark error and keep item (so user can remove/retry)
          onChange((prevValue) =>
            prevValue.map((item) =>
              item.id === mediaItem.id ? { ...item, status: "error" } : item
            )
          );

          // Option B: remove failed item entirely (uncomment if preferred)
          // onChange((prevValue) => prevValue.filter((item) => item.id !== mediaItem.id));
        } finally {
          URL.revokeObjectURL(localUrl);
        }
      });
    },
    [maxSizeMB, onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeMedia = useCallback(
    (id: string) => onChange((prev) => prev.filter((m) => m.id !== id)),
    [onChange]
  );

  return (
    <div className="mt-2 space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDrop={onDrop}
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
          onChange={onInput}
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
            Supports: JPG, PNG, GIF, MP4, MOV (Max {maxSizeMB}MB per file)
          </p>
        </div>
      </div>

      {value?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Files ({value.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {value.map((media) => (
              <div key={media.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                  {media.type === "IMAGE" ? (
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                      <video src={media.url} className="w-full h-full object-cover" controls />
                      <span className="text-xs text-gray-600 text-center px-2">
                        {media.name}
                      </span>
                      <video
                        src={media.url}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        muted
                      />
                    </div>
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Remove media"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Filename/size on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs truncate">{media.name}</p>
                    <p className="text-xs">{formatFileSize(media.size)}</p>
                  </div>

                  {/* NEW: overlay for uploading/error */}
                  {media.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    </div>
                  )}
                  {media.status === "error" && (
                    <div className="absolute inset-0 bg-red-600/60 text-white flex items-center justify-center text-xs font-medium">
                      Upload failed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};