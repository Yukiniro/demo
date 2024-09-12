export function generateDepthImage(file: File | Blob) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch("/api/generate-depth-image", {
    method: "POST",
    body: formData,
  });
}
