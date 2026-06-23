import { FileType } from "./upload-page.types";

export function getFileType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'vid';
  return 'ppt';
}

export function fileTypeLabel(type: FileType): string {
  return type === 'pdf' ? 'PDF' : type === 'vid' ? 'VID' : 'PPT';
}

export function fileTypeIconClasses(type: FileType): string {
  switch (type) {
    case 'pdf':
      return 'bg-[color-mix(in_srgb,var(--coral)_12%,transparent)] text-[var(--coral)]';
    case 'vid':
      return 'bg-[color-mix(in_srgb,var(--purple)_12%,transparent)] text-[var(--purple-lt)]';
    case 'ppt':
      return 'bg-[color-mix(in_srgb,var(--star)_14%,transparent)] text-[var(--star)]';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(1) + ' ميجا';
  }
  return (bytes / 1024).toFixed(0) + ' كيلو';
}
