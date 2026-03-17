import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const handleAuth = () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  // Listing cover image
  listingCoverImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Listing gallery images
  listingImages: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .middleware(() => handleAuth())
    .onUploadComplete(({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Doctor profile image
  doctorImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
