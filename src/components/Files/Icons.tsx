// Icons.tsx
import React from 'react';
import { 
  FaFolder, 
  FaFile, 
  FaFileImage, 
  FaFileVideo, 
  FaFileAudio, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFilePowerpoint, 
  FaFileCode, 
  FaFileArchive 
} from 'react-icons/fa';
import { IconType } from 'react-icons';

interface IconProps {
  style?: React.CSSProperties;
}

export const FolderIcon: React.FC<IconProps> = ({ style }) => {
  return <span style={style}><FaFolder /></span>;
};

const getFileIconComponent = (mimeType?: string, fileType?: string): IconType => {
  // Check based on MIME type first
  if (mimeType) {
    if (mimeType.startsWith('image/')) return FaFileImage;
    if (mimeType.startsWith('video/')) return FaFileVideo;
    if (mimeType.startsWith('audio/')) return FaFileAudio;
    if (mimeType === 'application/pdf') return FaFilePdf;
    // Additional MIME type checks can be added here...
  }
  
  // Fallback: check based on file extension (fileType)
  if (fileType) {
    const ext = fileType.toLowerCase();
    if (ext === 'doc' || ext === 'docx') return FaFileWord;
    if (ext === 'xls' || ext === 'xlsx') return FaFileExcel;
    if (ext === 'ppt' || ext === 'pptx') return FaFilePowerpoint;
    if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar') return FaFileArchive;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(ext)) return FaFileCode;
    // Additional file extension checks can be added here...
  }
  
  // Default icon if no match is found
  return FaFile;
};

interface FileIconProps extends IconProps {
  mimeType?: string;
  fileType?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ style, mimeType, fileType }) => {
  const IconComponent = getFileIconComponent(mimeType, fileType);
  return <span style={style}><IconComponent /></span>;
};
