import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  file: any; // You can replace 'any' with a more specific type if available.
  onClose: () => void;
  onOpen: (file: any) => void;
  onCopy: (file: any) => void;
  onMove: (file: any) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  file,
  onClose,
  onOpen,
  onCopy,
  onMove,
}) => {
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    background: '#fff',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    borderRadius: '4px',
    padding: '10px',
    zIndex: 4000,
  };

  const menuItemStyle: React.CSSProperties = { padding: '4px 8px', cursor: 'pointer' };

  return (
    <div style={menuStyle} onMouseLeave={onClose}>
      <div style={menuItemStyle} onClick={() => { onOpen(file); onClose(); }}>
        Open
      </div>
      <div style={menuItemStyle} onClick={() => { onCopy(file); onClose(); }}>
        Copy
      </div>
      <div style={menuItemStyle} onClick={() => { onMove(file); onClose(); }}>
        Move
      </div>
    </div>
  );
};

export default ContextMenu;
