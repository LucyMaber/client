import LocalNavigationBar from './LocalNavigationBar';
import ContentPane from './ContentPane';

// ===================== Split View Component =====================
// Includes local navigation bars for both source and target panes,
// plus operation buttons for copying/moving files in both directions.
function SplitView({
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
  // Navigation props for source
  sourceCurrentPath,
  sourceBackStack,
  sourceForwardStack,
  onSourceBreadcrumbSelect,
  onSourceBack,
  onSourceForward,
  onSourceReload,
  // Navigation props for target
  targetCurrentPath,
  targetBackStack,
  targetForwardStack,
  onTargetBreadcrumbSelect,
  onTargetBack,
  onTargetForward,
  onTargetReload,
  fileSystem,
  onDropItem,
}) {
  const operationButtonsStyle = { marginTop: '10px', display: 'flex', gap: '10px' };

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Source Pane with local navigation */}
        <div style={{ flex: 1, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
          <LocalNavigationBar
            currentPath={sourceCurrentPath}
            onBack={onSourceBack}
            onForward={onSourceForward}
            onReload={onSourceReload}
            canGoBack={sourceBackStack.length > 0}
            canGoForward={sourceForwardStack.length > 0}
            fileSystem={fileSystem}
            onBreadcrumbSelect={onSourceBreadcrumbSelect}
          />
          <div
            style={{ flex: 1 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const itemData = e.dataTransfer.getData('application/json');
              onDropItem && onDropItem(sourceCurrentPath, itemData);
            }}
          >
            <ContentPane
              currentFolder={sourceFolder}
              currentPath={sourceCurrentPath}
              onOpenFolder={() => {}}
              viewMode={sourceViewMode}
              onChangeViewMode={onChangeSourceViewMode}
              onFileClick={onFilePreview}
              onSelectFile={onSourceFileSelect}
              selectedFileId={selectedSourceFile ? selectedSourceFile.id : null}
              onFileContextMenu={() => {}}
              onDropItem={onDropItem}
            />
          </div>
          {selectedSourceFile && (
            <div style={operationButtonsStyle}>
              <button
                onClick={onCopyFileSourceToTarget}
                style={{
                  padding: '8px 12px',
                  background: '#4e54c8',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Copy →
              </button>
              <button
                onClick={onMoveFileSourceToTarget}
                style={{
                  padding: '8px 12px',
                  background: '#4e54c8',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Move →
              </button>
            </div>
          )}
        </div>
        {/* Target Pane with local navigation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <LocalNavigationBar
            currentPath={targetCurrentPath}
            onBack={onTargetBack}
            onForward={onTargetForward}
            onReload={onTargetReload}
            canGoBack={targetBackStack.length > 0}
            canGoForward={targetForwardStack.length > 0}
            fileSystem={fileSystem}
            onBreadcrumbSelect={onTargetBreadcrumbSelect}
          />
          <div
            style={{ flex: 1 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const itemData = e.dataTransfer.getData('application/json');
              onDropItem && onDropItem(targetCurrentPath, itemData);
            }}
          >
            <ContentPane
              currentFolder={targetFolder}
              currentPath={targetCurrentPath}
              onOpenFolder={onSelectTargetFolder}
              viewMode={targetViewMode}
              onChangeViewMode={onChangeTargetViewMode}
              onFileClick={() => {}}
              onSelectFile={onTargetFileSelect}
              selectedFileId={selectedTargetFile ? selectedTargetFile.id : null}
              onFileContextMenu={() => {}}
              onDropItem={onDropItem}
            />
          </div>
          {selectedTargetFile && (
            <div style={operationButtonsStyle}>
              <button
                onClick={onCopyFileTargetToSource}
                style={{
                  padding: '8px 12px',
                  background: '#4e54c8',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Copy ←
              </button>
              <button
                onClick={onMoveFileTargetToSource}
                style={{
                  padding: '8px 12px',
                  background: '#4e54c8',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Move ←
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SplitView;
