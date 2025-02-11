// Icons.js
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

export const FolderIcon = ({ style }) => {
  return <FaFolder style={style} />;
};

const getFileIconComponent = (mimeType, fileType) => {
  // Check based on MIME type first
  if (mimeType) {
    if (mimeType.startsWith('image/')) return FaFileImage;
    if (mimeType.startsWith('video/')) return FaFileVideo;
    if (mimeType.startsWith('audio/')) return FaFileAudio;
    if (mimeType === 'application/pdf') return FaFilePdf;
    // You can add additional MIME type checks here...
  }
  
  // Fallback: check based on file extension (fileType)
  if (fileType) {
    const ext = fileType.toLowerCase();
    if (ext === 'doc' || ext === 'docx') return FaFileWord;
    if (ext === 'xls' || ext === 'xlsx') return FaFileExcel;
    if (ext === 'ppt' || ext === 'pptx') return FaFilePowerpoint;
    if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar') return FaFileArchive;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json'].includes(ext)) return FaFileCode;
    // You can add additional file extension checks here...
  }
  
  // Default icon if no match is found
  return FaFile;
};

export const FileIcon = ({ style, mimeType, fileType }) => {
  const IconComponent = getFileIconComponent(mimeType, fileType);
  return <IconComponent style={style} />;
};
