import React from 'react';

interface FilePreviewModalProps {
  file: {
    name: string;
    description: string;
    // Add other file properties if needed.
  };
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const modalOverlay: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
  };

  const modalContent: React.CSSProperties = {
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    textAlign: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: '15px',
    padding: '8px 16px',
    background: '#4e54c8',
    border: 'none',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h3 style={{ color: '#4e54c8' }}>Preview: {file.name}</h3>
        <p>{file.description}</p>
        <button onClick={onClose} style={buttonStyle}>
          Close Preview
        </button>
      </div>
    </div>
  );
};

export default FilePreviewModal;
