export interface FileInfo {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number;
  modified?: string;
  extension?: string;
}

export interface ProjectFolder {
  path: string;
  name: string;
}

export interface FileViewState {
  selectedFile: FileInfo | null;
  currentPath: string;
  breadcrumbs: string[];
  isLoading: boolean;
  error: string | null;
}
