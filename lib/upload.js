const isUploadthingConfigured = () =>
  typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID;

export async function uploadImage(file) {
  if (isUploadthingConfigured()) {
    const { uploadFiles } = await import("uploadthing/client-future");
    const result = await uploadFiles("productImage", { files: [file] });
    return result[0]?.ufsUrl || result[0]?.url;
  }

  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}
