export type FileType = 'pdf' | 'vid' | 'ppt';

export type FileFilter = 'all' | FileType;

export interface Lesson {
  id: number;
  title: string;
}

export interface UploadedFile {
  id: number;
  name: string;
  type: FileType;
  size: string;
  date: string;
}

export interface QueuedFile {
  file: File;      
  name: string;
  size: string;
  type: FileType;
}
