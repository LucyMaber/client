import React, { useState } from 'react';

// Define an interface for a folder node.
export interface FolderNode {
  id: string;
  name: string;
  folders?: FolderNode[];
}

// Define the props for the TreeView component.
interface TreeViewProps {
  folder: FolderNode;
  path: string[];
  onSelectFolder: (path: string[]) => void;
  selectedPath: string[];
  onDropItem?: (path: string[], itemData: string) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  folder,
  path,
  onSelectFolder,
  selectedPath,
  onDropItem,
}) => {
  // Local state to track whether this node is expanded.
  const [expanded, setExpanded] = useState<boolean>(false);

  // Determine if this node is selected.
  const isSelected = JSON.stringify(path) === JSON.stringify(selectedPath);

  // Determine if this folder has children.
  const hasChildren = folder.folders && folder.folders.length > 0;

  return (
    <div style={{ marginLeft: path.length * 15, marginBottom: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Render an expand/collapse toggle if the folder has children */}
        {hasChildren ? (
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginRight: '5px',
            }}
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          // For alignment, render an empty placeholder if no children exist.
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              marginRight: '5px',
            }}
          />
        )}
        {/* The folder label */}
        <div
          draggable
          onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
            e.dataTransfer.setData(
              'application/json',
              JSON.stringify({ type: 'folder', id: folder.id })
            )
          }
          style={{
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            background: isSelected ? '#d0d0d0' : 'transparent',
            transition: 'background 0.3s',
          }}
          onClick={() => onSelectFolder(path)}
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
          onDrop={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const itemData = e.dataTransfer.getData('application/json');
            if (onDropItem) {
              onDropItem(path, itemData);
            }
          }}
          aria-expanded={hasChildren ? expanded : undefined}
        >
          {folder.name}
        </div>
      </div>
      {/* Render children only when expanded */}
      {expanded &&
        folder.folders?.map((subFolder) => (
          <TreeView
            key={subFolder.id}
            folder={subFolder}
            path={[...path, subFolder.id]}
            onSelectFolder={onSelectFolder}
            selectedPath={selectedPath}
            onDropItem={onDropItem}
          />
        ))}
    </div>
  );
};

export default TreeView;
