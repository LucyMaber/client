import React from 'react';
import TreeView from "./TreeView";
import { BreadcrumbData } from '../../types/Breadcrumb';

interface NavigationPaneProps {
  fileSystem: any; // You can replace 'any' with a more specific type if available.
  currentPath: BreadcrumbData[];
  breadcrumbs: BreadcrumbData[];
  onSelectFolder: (path: BreadcrumbData[]) => void;
  onDropItem?: (path: BreadcrumbData[], itemData: string) => void;
}

const NavigationPane: React.FC<NavigationPaneProps> = ({
  fileSystem,
  currentPath,
  onSelectFolder,
  onDropItem,
}) => {
  const paneStyle: React.CSSProperties = {
    padding: '15px',
    background: '#fff',
    height: '100%',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
    borderRight: '1px solid #eee',
  };

  return (
    <div style={paneStyle}>
      <h3 style={{ marginTop: 0, color: '#4e54c8' }}>Folders</h3>
      <TreeView
        folder={fileSystem}
        path={[{ label: 'root', "path":"/"}]}
        onSelectFolder={onSelectFolder}
        selectedPath={currentPath}
        onDropItem={onDropItem}
      />
    </div>
  );
};

export default NavigationPane;
