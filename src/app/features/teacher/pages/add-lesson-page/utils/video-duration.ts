/**
 * Reads the duration of a local video file through a throwaway `<video>` element.
 * Resolves `0` when the browser cannot decode the metadata, so the form stays usable.
 */
export function readVideoDuration(file: File, timeoutMs = 15_000): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.src = url;

    const finish = (duration: number) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      resolve(duration);
    };

    const timer = setTimeout(() => finish(0), timeoutMs);

    video.onloadedmetadata = () => finish(Number.isFinite(video.duration) ? video.duration : 0);
    video.onerror = () => finish(0);
  });
}
