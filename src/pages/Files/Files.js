import React, { useState } from 'react';

import NavigationBar from "../../components/Files/NavigationBar";
import NavigationPane from "../../components/Files/NavigationPane";
import SplitView from "../../components/Files/SplitView";
import ContentPane from "../../components/Files/ContentPane";
import FilePreviewModal from "../../components/Files/FilePreviewModal";
import ContextMenu from "../../components/Files/ContextMenu";

// ===================== In‑Memory File System =====================
const initialFileSystem = {
  id: 'root',
  name: 'Root',
  tags: [], // Root folder tags
  folders: [
    {
      id: 'folder1',
      name: 'Folder 1',
      tags: [],
      folders: [
        {
          id: 'folder1-1',
          name: 'Folder 1-1',
          tags: [],
          folders: [],
          files: [
            {
              id: 'file3',
              name: 'File 3',
              description: 'File in Folder 1-1',
              mimeType: 'image/png',
              fileType: 'png',
              tags: []
            },
          ],
        },
      ],
      files: [
        {
          id: 'file1',
          name: 'File 1',
          description: 'File in Folder 1',
          mimeType: 'text/plain',
          fileType: 'txt',
          tags: []
        },
      ],
    },
    {
      id: 'folder2',
      name: 'Folder 2',
      tags: [],
      folders: [],
      files: [
        {
          id: 'file2',
          name: 'File 2',
          description: 'File in Folder 2',
          mimeType: 'application/pdf',
          fileType: 'pdf',
          tags: []
        },
      ],
    },
  ],
  files: [
    {
      id: 'rootfile1',
      name: 'Root File 1',
      description: 'A file in Root',
      mimeType: 'video/mp4',
      fileType: 'mp4',
      tags: []
    },
  ],
};

// ---------------- Helper Functions ----------------
function getFolderByPath(fs, path) {
  let current = fs;
  for (let i = 1; i < path.length; i++) {
    current = current.folders.find((f) => f.id === path[i]);
    if (!current) return null;
  }
  return current;
}

function updateFolderInFS(fs, path, updater) {
  if (path.length === 1) {
    return updater(fs);
  }
  return {
    ...fs,
    folders: fs.folders.map((folder) =>
      folder.id === path[1]
        ? updateFolderInFS(folder, path.slice(1), updater)
        : folder
    ),
  };
}

function findFileInFS(fs, fileId) {
  for (let file of fs.files) {
    if (file.id === fileId) return { folder: fs, file };
  }
  for (let folder of fs.folders) {
    const result = findFileInFS(folder, fileId);
    if (result) return result;
  }
  return null;
}

function findFolderPath(fs, folderId, currentPath = ['root']) {
  if (fs.id === folderId) return currentPath;
  for (let folder of fs.folders) {
    const result = findFolderPath(folder, folderId, [...currentPath, folder.id]);
    if (result) return result;
  }
  return null;
}

// -------------------- Drag-and-Drop Handler --------------------
function processDropItem(prevFS, targetPath, itemDataJson) {
  const data = JSON.parse(itemDataJson);
  if (data.type === 'file') {
    const result = findFileInFS(prevFS, data.id);
    if (!result) return prevFS;
    const { folder: sourceFolder, file } = result;
    const target = getFolderByPath(prevFS, targetPath);
    if (!target) return prevFS;
    if (sourceFolder.id === target.id) return prevFS; // no change if same folder
    const sourcePath = findFolderPath(prevFS, sourceFolder.id);
    let newFS = updateFolderInFS(prevFS, sourcePath, (folder) => ({
      ...folder,
      files: folder.files.filter((f) => f.id !== data.id),
    }));
    newFS = updateFolderInFS(newFS, targetPath, (folder) => ({
      ...folder,
      files: [...folder.files, file],
    }));
    return newFS;
  } else if (data.type === 'folder') {
    // Prevent moving root or moving a folder into itself/descendant.
    const sourcePath = findFolderPath(prevFS, data.id);
    if (!sourcePath || sourcePath.length < 2) return prevFS;
    if (targetPath.includes(data.id)) return prevFS;
    const folderToMove = getFolderByPath(prevFS, sourcePath);
    if (!folderToMove) return prevFS;
    const parentPath = sourcePath.slice(0, -1);
    let newFS = updateFolderInFS(prevFS, parentPath, (parentFolder) => ({
      ...parentFolder,
      folders: parentFolder.folders.filter((f) => f.id !== data.id),
    }));
    newFS = updateFolderInFS(newFS, targetPath, (targetFolder) => ({
      ...targetFolder,
      folders: [...targetFolder.folders, folderToMove],
    }));
    return newFS;
  }
  return prevFS;
}

// -------------------- Tag Update Helper Functions --------------------
function updateFileTags(fs, fileId, newTags) {
  const result = findFileInFS(fs, fileId);
  if (!result) return fs;
  const { folder, file } = result;
  const updatedFile = { ...file, tags: newTags };
  const folderPath = findFolderPath(fs, folder.id);
  return updateFolderInFS(fs, folderPath, (folder) => ({
    ...folder,
    files: folder.files.map((f) => (f.id === fileId ? updatedFile : f)),
  }));
}

function updateFolderTags(fs, folderId, newTags) {
  const folderPath = findFolderPath(fs, folderId);
  if (!folderPath) return fs;
  return updateFolderInFS(fs, folderPath, (folder) => ({
    ...folder,
    tags: newTags,
  }));
}

function updateItemTags(fs, item, newTags) {
  // If the item has mimeType and fileType, assume it's a file; otherwise, treat it as a folder.
  if (item.mimeType !== undefined && item.fileType !== undefined) {
    return updateFileTags(fs, item.id, newTags);
  } else {
    return updateFolderTags(fs, item.id, newTags);
  }
}

// ===================== Main App Component =====================
function App() {
  // Global file system state.
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [currentPath, setCurrentPath] = useState(['root']);
  const [backStack, setBackStack] = useState([]);
  const [forwardStack, setForwardStack] = useState([]);
  const currentFolder = getFolderByPath(fileSystem, currentPath);

  // Source Navigation Handlers
  const handleBreadcrumbSelect = (newPath) => {
    if (JSON.stringify(newPath) !== JSON.stringify(currentPath)) {
      setBackStack([...backStack, currentPath]);
      setForwardStack([]);
      setCurrentPath(newPath);
    }
  };

  const handleSelectFolder = (newPath) => {
    if (JSON.stringify(newPath) !== JSON.stringify(currentPath)) {
      setBackStack([...backStack, currentPath]);
      setForwardStack([]);
      setCurrentPath(newPath);
    }
  };

  const handleOpenFolderFromContents = (folderId) => {
    if (!currentFolder) return;
    const newPath = [...currentPath, folderId];
    setBackStack([...backStack, currentPath]);
    setForwardStack([]);
    setCurrentPath(newPath);
  };

  const handleBack = () => {
    if (backStack.length === 0) return;
    const previous = backStack[backStack.length - 1];
    setBackStack(backStack.slice(0, backStack.length - 1));
    setForwardStack([currentPath, ...forwardStack]);
    setCurrentPath(previous);
  };

  const handleForward = () => {
    if (forwardStack.length === 0) return;
    const next = forwardStack[0];
    setForwardStack(forwardStack.slice(1));
    setBackStack([...backStack, currentPath]);
    setCurrentPath(next);
  };

  const handleReload = () => {
    setCurrentPath([...currentPath]);
  };

  // ===================== View Mode State =====================
  const [viewModes, setViewModes] = useState({});
  const currentViewMode = viewModes[currentFolder?.id] || 'icons';

  const handleChangeViewMode = (mode) => {
    if (currentFolder) {
      setViewModes({ ...viewModes, [currentFolder.id]: mode });
    }
  };

  // ===================== Split View State =====================
  const [splitView, setSplitView] = useState(false);
  const [targetPath, setTargetPath] = useState(['root']);
  const targetFolder = getFolderByPath(fileSystem, targetPath);
  const [targetViewModes, setTargetViewModes] = useState({});
  const targetViewMode = targetFolder ? (targetViewModes[targetFolder.id] || 'icons') : 'icons';

  const toggleSplitView = () => {
    setSplitView(!splitView);
  };

  // Target Navigation State
  const [targetBackStack, setTargetBackStack] = useState([]);
  const [targetForwardStack, setTargetForwardStack] = useState([]);

  const handleTargetBreadcrumbSelect = (newPath) => {
    if (JSON.stringify(newPath) !== JSON.stringify(targetPath)) {
      setTargetBackStack([...targetBackStack, targetPath]);
      setTargetForwardStack([]);
      setTargetPath(newPath);
    }
  };

  const handleTargetBack = () => {
    if (targetBackStack.length === 0) return;
    const previous = targetBackStack[targetBackStack.length - 1];
    setTargetBackStack(targetBackStack.slice(0, targetBackStack.length - 1));
    setTargetForwardStack([targetPath, ...targetForwardStack]);
    setTargetPath(previous);
  };

  const handleTargetForward = () => {
    if (targetForwardStack.length === 0) return;
    const next = targetForwardStack[0];
    setTargetForwardStack(targetForwardStack.slice(1));
    setTargetBackStack([...targetBackStack, targetPath]);
    setTargetPath(next);
  };

  const handleTargetReload = () => {
    setTargetPath([...targetPath]);
  };

  // ===================== File Preview State =====================
  const [previewFile, setPreviewFile] = useState(null);
  const handleFilePreview = (file) => setPreviewFile(file);
  const closeFilePreview = () => setPreviewFile(null);

  // ===================== File Operation State =====================
  // Separate selections for source and target panes.
  const [selectedSourceFile, setSelectedSourceFile] = useState(null);
  const [selectedTargetFile, setSelectedTargetFile] = useState(null);

  // Operation handlers for source → target:
  const handleCopyFileSourceToTarget = () => {
    if (!selectedSourceFile) return;
    setFileSystem((prevFS) => {
      const target = getFolderByPath(prevFS, targetPath);
      if (!target) return prevFS;
      // Copy the file and generate a new id while preserving mimeType and fileType.
      const newFile = { ...selectedSourceFile, id: Date.now().toString() };
      const updatedTarget = {
        ...target,
        files: [...target.files, newFile],
      };
      return updateFolderInFS(prevFS, targetPath, () => updatedTarget);
    });
    setSelectedSourceFile(null);
  };

  const handleMoveFileSourceToTarget = () => {
    if (!selectedSourceFile) return;
    setFileSystem((prevFS) => {
      const source = getFolderByPath(prevFS, currentPath);
      const target = getFolderByPath(prevFS, targetPath);
      if (!source || !target) return prevFS;
      const updatedSource = {
        ...source,
        files: source.files.filter((f) => f.id !== selectedSourceFile.id),
      };
      const updatedTarget = {
        ...target,
        files: [...target.files, selectedSourceFile],
      };
      let newFS = updateFolderInFS(prevFS, currentPath, () => updatedSource);
      newFS = updateFolderInFS(newFS, targetPath, () => updatedTarget);
      return newFS;
    });
    setSelectedSourceFile(null);
  };

  // Operation handlers for target → source:
  const handleCopyFileTargetToSource = () => {
    if (!selectedTargetFile) return;
    setFileSystem((prevFS) => {
      const source = getFolderByPath(prevFS, currentPath);
      if (!source) return prevFS;
      const newFile = { ...selectedTargetFile, id: Date.now().toString() };
      const updatedSource = {
        ...source,
        files: [...source.files, newFile],
      };
      return updateFolderInFS(prevFS, currentPath, () => updatedSource);
    });
    setSelectedTargetFile(null);
  };

  const handleMoveFileTargetToSource = () => {
    if (!selectedTargetFile) return;
    setFileSystem((prevFS) => {
      const source = getFolderByPath(prevFS, currentPath);
      const target = getFolderByPath(prevFS, targetPath);
      if (!source || !target) return prevFS;
      const updatedTarget = {
        ...target,
        files: target.files.filter((f) => f.id !== selectedTargetFile.id),
      };
      const updatedSource = {
        ...source,
        files: [...source.files, selectedTargetFile],
      };
      let newFS = updateFolderInFS(prevFS, targetPath, () => updatedTarget);
      newFS = updateFolderInFS(newFS, currentPath, () => updatedSource);
      return newFS;
    });
    setSelectedTargetFile(null);
  };

  // ===================== Drag and Drop Handler =====================
  const handleDropItem = (targetPath, itemDataJson) => {
    setFileSystem((prevFS) => processDropItem(prevFS, targetPath, itemDataJson));
  };

  // ===================== Context Menu State =====================
  const [contextMenu, setContextMenu] = useState(null);
  const handleFileContextMenu = (file, event) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, file });
  };
  const closeContextMenu = () => setContextMenu(null);
  const handleContextOpen = (file) => { handleFilePreview(file); };
  const handleContextCopy = (file) => { console.log('Copy file:', file); };
  const handleContextMove = (file) => { console.log('Move file:', file); };

  // ===================== Tag Handler =====================
  const handleTagItem = (item) => {
    const currentTagsStr = item.tags && item.tags.length > 0 ? item.tags.join(', ') : '';
    const newTagsStr = window.prompt("Enter tags (comma separated):", currentTagsStr);
    if (newTagsStr !== null) {
      const newTags = newTagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFileSystem(prevFS => updateItemTags(prevFS, item, newTags));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      <NavigationBar
        currentPath={currentPath}
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        canGoBack={backStack.length > 0}
        canGoForward={forwardStack.length > 0}
        fileSystem={fileSystem}
        onBreadcrumbSelect={handleBreadcrumbSelect}
        onToggleSplitView={toggleSplitView}
        splitView={splitView}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ width: '250px', borderRight: '1px solid #eee', overflowY: 'auto' }}>
          <NavigationPane
            fileSystem={fileSystem}
            currentPath={currentPath}
            onSelectFolder={handleSelectFolder}
            onDropItem={handleDropItem}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {splitView ? (
            <SplitView
              sourceFolder={currentFolder || { id: 'none', name: 'N/A', folders: [], files: [] }}
              targetFolder={targetFolder || { id: 'none', name: 'N/A', folders: [], files: [] }}
              sourceViewMode={currentViewMode}
              targetViewMode={targetViewMode}
              onChangeSourceViewMode={handleChangeViewMode}
              onChangeTargetViewMode={(mode) => {
                if (targetFolder) setTargetViewModes({ ...targetViewModes, [targetFolder.id]: mode });
              }}
              // Source pane selection
              onSourceFileSelect={(file) => setSelectedSourceFile(file)}
              selectedSourceFile={selectedSourceFile}
              // Target pane selection
              onTargetFileSelect={(file) => setSelectedTargetFile(file)}
              selectedTargetFile={selectedTargetFile}
              onFilePreview={handleFilePreview}
              // Operations: source → target
              onCopyFileSourceToTarget={handleCopyFileSourceToTarget}
              onMoveFileSourceToTarget={handleMoveFileSourceToTarget}
              // Operations: target → source
              onCopyFileTargetToSource={handleCopyFileTargetToSource}
              onMoveFileTargetToSource={handleMoveFileTargetToSource}
              onSelectTargetFolder={(folderId) => setTargetPath([...targetPath, folderId])}
              targetPath={targetPath}
              // Source local navigation props
              sourceCurrentPath={currentPath}
              sourceBackStack={backStack}
              sourceForwardStack={forwardStack}
              onSourceBreadcrumbSelect={handleBreadcrumbSelect}
              onSourceBack={handleBack}
              onSourceForward={handleForward}
              onSourceReload={handleReload}
              // Target local navigation props
              targetCurrentPath={targetPath}
              targetBackStack={targetBackStack}
              targetForwardStack={targetForwardStack}
              onTargetBreadcrumbSelect={handleTargetBreadcrumbSelect}
              onTargetBack={handleTargetBack}
              onTargetForward={handleTargetForward}
              onTargetReload={handleTargetReload}
              fileSystem={fileSystem}
              onDropItem={handleDropItem}
            />
          ) : (
            <ContentPane
              currentFolder={currentFolder}
              currentPath={currentPath}
              onOpenFolder={handleOpenFolderFromContents}
              viewMode={currentViewMode}
              onChangeViewMode={handleChangeViewMode}
              onFileClick={handleFilePreview}
              onSelectFile={(file) => setSelectedSourceFile(file)}
              selectedFileId={selectedSourceFile ? selectedSourceFile.id : null}
              onFileContextMenu={handleFileContextMenu}
              onDropItem={handleDropItem}
              onTagItem={handleTagItem}  // Pass the tag handler to allow editing tags
            />
          )}
        </div>
      </div>

      {previewFile && <FilePreviewModal file={previewFile} onClose={closeFilePreview} />}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onClose={closeContextMenu}
          onOpen={handleContextOpen}
          onCopy={handleContextCopy}
          onMove={handleContextMove}
        />
      )}
    </div>
  );
}

export default App;
