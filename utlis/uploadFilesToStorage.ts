// lib/uploadFilesToStorage.ts

import { uploadToCloudinary } from "@/servers/utils/uploadToCloudinary";


export async function uploadFilesToStorage(files: File[]) {
  return Promise.all(
    files.map(async (file) => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      const resourceType = isVideo ? "video" : (isImage || isPdf) ? "image" : "raw";

      if (!isVideo && !isImage && !isPdf) {
        throw new Error("Unsupported file type. Only images, videos and PDFs are allowed.");
      }

      const res = await uploadToCloudinary(file, resourceType as "image" | "video");
      return {
        url: res.url,
        type: (isVideo ? "VIDEO" : "IMAGE") as "VIDEO" | "IMAGE",
      };
    })
  );
}