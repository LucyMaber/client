// ===================== Context Menu Component =====================
function ContextMenu({ x, y, file, onClose, onOpen, onCopy, onMove }) {
    const menuStyle = {
      position: 'fixed',
      top: y,
      left: x,
      background: '#fff',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      borderRadius: '4px',
      padding: '10px',
      zIndex: 4000,
    };
    const menuItemStyle = { padding: '4px 8px', cursor: 'pointer' };
  
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
  }
  export default ContextMenu;