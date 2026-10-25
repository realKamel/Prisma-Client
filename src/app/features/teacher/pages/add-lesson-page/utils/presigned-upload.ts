/**
 * PUTs a file straight to a pre-signed storage URL (the API returns it with the lesson).
 * `fetch` only rejects on network errors, so a 403/404 from the storage is turned into a rejection here.
 */
export async function uploadToPresignedUrl(url: string, file: File): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });

  if (!response.ok) throw new Error(`Upload failed (${response.status})`);
}
