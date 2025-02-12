import React from 'react';
import LocalNavigationBar from './LocalNavigationBar';
import ContentPane from './ContentPane';

interface SplitViewProps {
  sourceFolder: any;
  targetFolder: any;
  sourceViewMode: string;
  targetViewMode: string;
  onChangeSourceViewMode: (mode: string) => void;
  onChangeTargetViewMode: (mode: string) => void;
  onSourceFileSelect: (file: any) => void;
  selectedSourceFile: any | null;
  onTargetFileSelect: (file: any) => void;
  selectedTargetFile: any | null;
  onFilePreview: (file: any) => void;
  onCopyFileSourceToTarget: () => void;
  onMoveFileSourceToTarget: () => void;
  onCopyFileTargetToSource: () => void;
  onMoveFileTargetToSource: () => void;
  onSelectTargetFolder: (folderId: string) => void;
  targetPath: string[];
  // Navigation props for source
  sourceCurrentPath: string[];
  sourceBackStack: string[][];
  sourceForwardStack: string[][];
  onSourceBreadcrumbSelect: (path: string[]) => void;
  onSourceBack: () => void;
  onSourceForward: () => void;
  onSourceReload: () => void;
  // Navigation props for target
  targetCurrentPath: string[];
  targetBackStack: string[][];
  targetForwardStack: string[][];
  onTargetBreadcrumbSelect: (path: string[]) => void;
  onTargetBack: () => void;
  onTargetForward: () => void;
  onTargetReload: () => void;
  fileSystem: any;
  onDropItem?: (path: string[], itemData: string) => void;
}

// Helper type for navigation-related props used by each pane.
interface NavigationProps {
  backStack: string[][];
  forwardStack: string[][];
  onBreadcrumbSelect: (path: string[]) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
}

interface FilePaneProps {
  currentFolder: any;
  currentPath: string[];
  onOpenFolder: (folderId: string) => void;
  viewMode: string;
  onChangeViewMode: (mode: string) => void;
  onFileClick: (file: any) => void;
  onSelectFile: (file: any) => void;
  selectedFile: any | null;
  navigation: NavigationProps;
  fileSystem: any;
  onDropItem?: (path: string[], itemData: string) => void;
  footer?: React.ReactNode;
  hasBorder?: boolean;
}

const noop = () => {};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#4e54c8',
  border: 'none',
  color: '#fff',
  borderRadius: '4px',
  cursor: 'pointer',
};

const operationButtonsStyle: React.CSSProperties = {
  marginTop: '10px',
  display: 'flex',
  gap: '10px',
};

const FilePane: React.FC<FilePaneProps> = ({
  currentFolder,
  currentPath,
  onOpenFolder,
  viewMode,
  onChangeViewMode,
  onFileClick,
  onSelectFile,
  selectedFile,
  navigation,
  fileSystem,
  onDropItem,
  footer,
  hasBorder = false,
}) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ...(hasBorder ? { borderRight: '1px solid #eee' } : {}),
      }}
    >
      <LocalNavigationBar
        currentPath={currentPath}
        onBack={navigation.onBack}
        onForward={navigation.onForward}
        onReload={navigation.onReload}
        canGoBack={navigation.backStack.length > 0}
        canGoForward={navigation.forwardStack.length > 0}
        fileSystem={fileSystem}
        onBreadcrumbSelect={navigation.onBreadcrumbSelect}
      />
      <div
        style={{ flex: 1 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const itemData = e.dataTransfer.getData('application/json');
          if (onDropItem) {
            onDropItem(currentPath, itemData);
          }
        }}
      >
        <ContentPane
          currentFolder={currentFolder}
          currentPath={currentPath}
          onOpenFolder={onOpenFolder}
          viewMode={viewMode}
          onChangeViewMode={onChangeViewMode}
          onFileClick={onFileClick}
          onSelectFile={onSelectFile}
          selectedFileId={selectedFile ? selectedFile.id : null}
          onFileContextMenu={noop}
          onDropItem={onDropItem || noop}
          onTagItem={noop}
          availableTags={[]}
        />
      </div>
      {footer}
    </div>
  );
};

const SplitView: React.FC<SplitViewProps> = ({
  sourceFolder,
  targetFolder,
  sourceViewMode,
  targetViewMode,
  onChangeSourceViewMode,
  onChangeTargetViewMode,
  onSourceFileSelect,
  selectedSourceFile,
  onTargetFileSelect,
  selectedTargetFile,
  onFilePreview,
  onCopyFileSourceToTarget,
  onMoveFileSourceToTarget,
  onCopyFileTargetToSource,
  onMoveFileTargetToSource,
  onSelectTargetFolder,
  targetPath,
  sourceCurrentPath,
  sourceBackStack,
  sourceForwardStack,
  onSourceBreadcrumbSelect,
  onSourceBack,
  onSourceForward,
  onSourceReload,
  targetCurrentPath,
  targetBackStack,
  targetForwardStack,
  onTargetBreadcrumbSelect,
  onTargetBack,
  onTargetForward,
  onTargetReload,
  fileSystem,
  onDropItem,
}) => {
  // Define the footer (operation buttons) for each pane.
  const sourceFooter = selectedSourceFile && (
    <div style={operationButtonsStyle}>
      <button onClick={onCopyFileSourceToTarget} style={buttonStyle}>
        Copy →
      </button>
      <button onClick={onMoveFileSourceToTarget} style={buttonStyle}>
        Move →
      </button>
    </div>
  );

  const targetFooter = selectedTargetFile && (
    <div style={operationButtonsStyle}>
      <button onClick={onCopyFileTargetToSource} style={buttonStyle}>
        Copy ←
      </button>
      <button onClick={onMoveFileTargetToSource} style={buttonStyle}>
        Move ←
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Source Pane */}
        <FilePane
          currentFolder={sourceFolder}
          currentPath={sourceCurrentPath}
          onOpenFolder={noop} // No action specified in the original code
          viewMode={sourceViewMode}
          onChangeViewMode={onChangeSourceViewMode}
          onFileClick={onFilePreview}
          onSelectFile={onSourceFileSelect}
          selectedFile={selectedSourceFile}
          navigation={{
            backStack: sourceBackStack,
            forwardStack: sourceForwardStack,
            onBreadcrumbSelect: onSourceBreadcrumbSelect,
            onBack: onSourceBack,
            onForward: onSourceForward,
            onReload: onSourceReload,
          }}
          fileSystem={fileSystem}
          onDropItem={onDropItem}
          footer={sourceFooter}
          hasBorder={true}
        />
        {/* Target Pane */}
        <FilePane
          currentFolder={targetFolder}
          currentPath={targetCurrentPath}
          onOpenFolder={onSelectTargetFolder}
          viewMode={targetViewMode}
          onChangeViewMode={onChangeTargetViewMode}
          onFileClick={noop} // No file click action provided for the target
          onSelectFile={onTargetFileSelect}
          selectedFile={selectedTargetFile}
          navigation={{
            backStack: targetBackStack,
            forwardStack: targetForwardStack,
            onBreadcrumbSelect: onTargetBreadcrumbSelect,
            onBack: onTargetBack,
            onForward: onTargetForward,
            onReload: onTargetReload,
          }}
          fileSystem={fileSystem}
          onDropItem={onDropItem}
          footer={targetFooter}
        />
      </div>
    </div>
  );
};

export default SplitView;
