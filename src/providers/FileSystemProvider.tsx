// FileSystemProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { TagData } from '../types/TagData';

// --- Types for Files and Folders ---
export interface FileEntry {
  type: 'file' | 'folder';
  mimeType: string | undefined;
  description: string;
  name: string;
  path: string;
  size?: number;
  id: string;
  modified?: string;
  tags: TagData[]; 
  fileType: string;
};

// --- The interface listing all operations that your provider supports ---
export interface FileSystemContextProps {
  // Current working directory path
  currentPath: string;
  // The list of entries (files and folders) in the current directory.
  files: FileEntry[];
  TagItem: (item: any, newTags:TagData[]) => Promise<void>;
  // Navigation: change current working directory
  chdir: (path: string) => Promise<void>;
  // File/folder property operations
  chflags: (path: string, flags: any) => Promise<void>;
  fchdir: (fd: number) => Promise<void>;
  lchflags: (path: string, flags: any) => Promise<void>;
  // Directory creation
  mkdir: (path: string) => Promise<void>;
  makedirs: (path: string) => Promise<void>;
  // Create a link (hard or soft; depends on your API)
  link: (src: string, dest: string) => Promise<void>;
  // Remove a file or folder
  remove: (path: string) => Promise<void>;
  removedirs: (path: string) => Promise<void>;
  // Rename operations
  rename: (oldPath: string, newPath: string) => Promise<void>;
  renames: (oldPath: string, newPath: string) => Promise<void>;
  replace: (src: string, dest: string) => Promise<void>;
  rmdir: (path: string) => Promise<void>;
  // Directory listings
  scandir: (path?: string) => Promise<FileEntry[]>;
  listdir: (path?: string) => Promise<string[]>;
  // File uploads
  uploadFile: (path: string, file: File) => Promise<void>;
  uploadFiles: (path: string, files: File[]) => Promise<void>;
  uploadFolder: (path: string, folderFiles: File[]) => Promise<void>;
  // A refresh function to reload the current directory
  refresh: () => Promise<void>;
  // Direct setter for the current path if needed
  setCurrentPath: (path: string) => void;
  // New operations for copying and moving files:
  copyFile: (source: string, destination: string) => Promise<void>;
  moveFile: (source: string, destination: string) => Promise<void>;
}

// Create the context with an undefined default.
const FileSystemContext = createContext<FileSystemContextProps | undefined>(
  undefined
);

// A simple hook so that consumers can use the context
export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

interface FileSystemProviderProps {
  children: ReactNode;
}

// --- The Provider Component ---
export const FileSystemProvider: React.FC<FileSystemProviderProps> = ({
  children,
}) => {
  // Keep the current working directory and file list in state.
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [files, setFiles] = useState<FileEntry[]>([]);

  // Base URL for your API endpoints (adjust as needed)
  const apiBase = '/api/fs';

  // --- Helper: refresh the file list for the current path ---
  const refresh = async () => {
    try {
      const response = await axios.get(`${apiBase}/scandir`, {
        params: { path: currentPath },
      });
      // We assume the API returns an array of FileEntry objects.
      setFiles(response.data);
    } catch (error) {
      console.error('Error refreshing file list:', error);
    }
  };

  // --- File system operations – each makes an HTTP request and then calls refresh() ---
  const chdir = async (path: string) => {
    setCurrentPath(path);
    await refresh();
  };

  const chflags = async (path: string, flags: any) => {
    await axios.post(`${apiBase}/chflags`, { path, flags });
    await refresh();
  };

  const fchdir = async (fd: number) => {
    await axios.post(`${apiBase}/fchdir`, { fd });
    await refresh();
  };

  const lchflags = async (path: string, flags: any) => {
    await axios.post(`${apiBase}/lchflags`, { path, flags });
    await refresh();
  };

  const mkdir = async (path: string) => {
    await axios.post(`${apiBase}/mkdir`, { path });
    await refresh();
  };

  const makedirs = async (path: string) => {
    await axios.post(`${apiBase}/makedirs`, { path });
    await refresh();
  };

  const link = async (src: string, dest: string) => {
    await axios.post(`${apiBase}/link`, { src, dest });
    await refresh();
  };

  const remove = async (path: string) => {
    await axios.post(`${apiBase}/remove`, { path });
    await refresh();
  };

  const removedirs = async (path: string) => {
    await axios.post(`${apiBase}/removedirs`, { path });
    await refresh();
  };

  const rename = async (oldPath: string, newPath: string) => {
    await axios.post(`${apiBase}/rename`, { oldPath, newPath });
    await refresh();
  };

  const renames = async (oldPath: string, newPath: string) => {
    await axios.post(`${apiBase}/renames`, { oldPath, newPath });
    await refresh();
  };

  const replace = async (src: string, dest: string) => {
    await axios.post(`${apiBase}/replace`, { src, dest });
    await refresh();
  };

  const rmdir = async (path: string) => {
    await axios.post(`${apiBase}/rmdir`, { path });
    await refresh();
  };

  const scandir = async (path?: string) => {
    const targetPath = path || currentPath;
    const response = await axios.get(`${apiBase}/scandir`, {
      params: { path: targetPath },
    });
    return response.data;
  };

  const listdir = async (path?: string) => {
    const targetPath = path || currentPath;
    const response = await axios.get(`${apiBase}/listdir`, {
      params: { path: targetPath },
    });
    return response.data;
  };

  const uploadFile = async (path: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    await axios.post(`${apiBase}/uploadFile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await refresh();
  };

  const uploadFiles = async (path: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('path', path);
    await axios.post(`${apiBase}/uploadFiles`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await refresh();
  };

  const uploadFolder = async (path: string, folderFiles: File[]) => {
    const formData = new FormData();
    folderFiles.forEach((file) => formData.append('files', file));
    formData.append('path', path);
    await axios.post(`${apiBase}/uploadFolder`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await refresh();
  };

  // --- New Operations: copyFile and moveFile ---
  const copyFile = async (source: string, destination: string) => {
    try {
      await axios.post(`${apiBase}/copyFile`, { source, destination });
      await refresh();
    } catch (error) {
      console.error('Error copying file:', error);
    }
  };

  const moveFile = async (source: string, destination: string) => {
    try {
      await axios.post(`${apiBase}/moveFile`, { source, destination });
      await refresh();
    } catch (error) {
      console.error('Error moving file:', error);
    }
  };

    // --- Tag Handling & Create Tag Popup ---
    const TagItem = async (item: FileEntry, newTags:TagData[]) => {
      try {
        await axios.post('/api/updateTags', {
          path: item.path,
          tags: newTags,
        });
        refresh();
      } catch (error) {
        console.error('Error updating tags:', error);
      }
    };
  

  // Refresh the file list when the currentPath changes.
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  // --- The context value which exposes our operations ---
  const contextValue: FileSystemContextProps = {
    currentPath,
    files,
    TagItem,
    chdir,
    chflags,
    fchdir,
    lchflags,
    mkdir,
    makedirs,
    link,
    remove,
    removedirs,
    rename,
    renames,
    replace,
    rmdir,
    scandir,
    listdir,
    uploadFile,
    uploadFiles,
    uploadFolder,
    refresh,
    setCurrentPath,
    copyFile,
    moveFile,
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};

export default FileSystemProvider;
export { FileSystemContext };
