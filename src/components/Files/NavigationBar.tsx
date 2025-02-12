import React, { memo } from 'react';
import Breadcrumb from './Breadcrumb';

interface NavigationBarProps {
  currentPath: string[];
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  fileSystem: any; // Replace 'any' with a more specific type if available.
  onBreadcrumbSelect: (newPath: string[]) => void;
  onToggleSplitView: () => void;
  splitView: boolean;
  createTag: () => void;
}

// External styles object (won't be re-created on every render)
const styles: { [key: string]: React.CSSProperties } = {
  header: {
    padding: '10px 20px',
    background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#fff',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    border: 'none',
    color: '#fff',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  flex: {
    flex: 1,
  },
};

const NavigationBar: React.FC<NavigationBarProps> = memo(({
  currentPath,
  onBack,
  onForward,
  onReload,
  canGoBack,
  canGoForward,
  fileSystem,
  onBreadcrumbSelect,
  onToggleSplitView,
  splitView,
  createTag,
}) => {
  return (
    <div style={styles.header}>
      <button
        onClick={onBack}
        disabled={!canGoBack}
        style={styles.button}
        aria-label="Back"
      >
        Back
      </button>
      <button
        onClick={onForward}
        disabled={!canGoForward}
        style={styles.button}
        aria-label="Forward"
      >
        Forward
      </button>
      <button onClick={onReload} style={styles.button} aria-label="Reload">
        Reload
      </button>
      <div style={styles.flex}>
        <Breadcrumb
          currentPath={currentPath}
          fileSystem={fileSystem}
          onSelect={onBreadcrumbSelect}
        />
      </div>
      <button
        onClick={createTag}
        style={styles.button}
        aria-label="create Tag"
      >
        create Tag
      </button>
      <button onClick={onToggleSplitView} style={styles.button}>
        {splitView ? 'Disable Split View' : 'Enable Split View'}
      </button>
    </div>
  );
});

export default NavigationBar;
