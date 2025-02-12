import React from 'react';

// External style objects
const containerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '5px',
  alignItems: 'center',
  fontSize: '0.9rem',
};

const itemStyle: React.CSSProperties = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: '#fff',
  transition: 'color 0.3s',
};

const separatorStyle: React.CSSProperties = {
  color: '#fff',
};

// Optional: Define a type for the file system node.
export interface FileSystemNode {
  id: string;
  name: string;
  folders?: FileSystemNode[];
}

// Helper function to compute names based on the file system structure and current path.
function getPathNames(fs: FileSystemNode | null, path: string[]): string[] {
  const names: string[] = [];
  let current = fs;
  if (!current) return [];
  names.push(current.name);

  // Start at index 1 since index 0 is assumed to be the root.
  for (let i = 1; i < path.length; i++) {
    if (!current || !current.folders) break;
    const next: FileSystemNode | undefined = current.folders.find((f: FileSystemNode) => f.id === path[i]);
    if (next) {
      names.push(next.name);
      current = next;
    } else {
      break;
    }
  }
  return names;
}

// Props interface for Breadcrumb
interface BreadcrumbProps {
  currentPath: string[];
  fileSystem: FileSystemNode | null;
  onSelect: (path: string[]) => void;
  separator?: React.ReactNode;
}

// Breadcrumb component wrapped in React.memo for performance
const Breadcrumb: React.FC<BreadcrumbProps> = React.memo(({
  currentPath,
  fileSystem,
  onSelect,
  separator = ' / ',
}) => {
  const names = getPathNames(fileSystem, currentPath);

  return (
    <div style={containerStyle}>
      {names.map((name, index) => {
        const pathForItem = currentPath.slice(0, index + 1);
        return (
          <span key={pathForItem.join('-')}>
            <span
              style={itemStyle}
              onClick={() => onSelect(pathForItem)}
              onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#ffdd57')}
              onMouseOut={(e) => ((e.target as HTMLElement).style.color = '#fff')}
            >
              {name}
            </span>
            {index < names.length - 1 && <span style={separatorStyle}>{separator}</span>}
          </span>
        );
      })}
    </div>
  );
});

export default Breadcrumb;
