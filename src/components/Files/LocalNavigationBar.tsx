import React, { memo } from 'react';
import Breadcrumb from './Breadcrumb';

// Define external style objects with proper typing.
const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  background: '#f9f9f9',
  padding: '5px',
  borderBottom: '1px solid #ddd',
  fontSize: '0.9rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: 'none',
  background: '#ddd',
  borderRadius: '3px',
  cursor: 'pointer',
};

// Define the props interface for LocalNavigationBar.
interface LocalNavigationBarProps {
  currentPath: string[];
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  fileSystem: any; // Replace 'any' with a more specific type if available.
  onBreadcrumbSelect: (path: string[]) => void;
}

// LocalNavigationBar Component wrapped in React.memo for performance.
const LocalNavigationBar: React.FC<LocalNavigationBarProps> = memo(({
  currentPath,
  onBack,
  onForward,
  onReload,
  canGoBack,
  canGoForward,
  fileSystem,
  onBreadcrumbSelect,
}) => (
  <div style={navStyle}>
    <button 
      onClick={onBack} 
      disabled={!canGoBack} 
      style={buttonStyle}
      aria-label="Go Back"
    >
      ◀
    </button>
    <button 
      onClick={onForward} 
      disabled={!canGoForward} 
      style={buttonStyle}
      aria-label="Go Forward"
    >
      ▶
    </button>
    <button 
      onClick={onReload} 
      style={buttonStyle}
      aria-label="Reload"
    >
      ⟳
    </button>
    <Breadcrumb 
      currentPath={currentPath} 
      fileSystem={fileSystem} 
      onSelect={onBreadcrumbSelect} 
    />
  </div>
));

export default LocalNavigationBar;
