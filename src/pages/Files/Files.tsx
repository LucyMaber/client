import React, { useState } from 'react';
import TagSelector from "../../components/Tagg/TagSelector";
import NavigationBar from "../../components/Files/NavigationBar";
import NavigationPane from "../../components/Files/NavigationPane";
import SplitView from "../../components/Files/SplitView";
import ContentPane from "../../components/Files/ContentPane";
import FilePreviewModal from "../../components/Files/FilePreviewModal";
import ContextMenu from "../../components/Files/ContextMenu";
import CreateTagPopup from "../../components/Tagg/CreateTagPopup";
import { TagData } from '../../types/TagData';

// ===================== In‑Memory File System =====================
const initialFileSystem = {
  id: 'root',
  name: 'Root',
  tags: [],
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
            }
          ]
        }
      ],
      files: [
        {
          id: 'file1',
          name: 'File 1',
          description: 'File in Folder 1',
          mimeType: 'text/plain',
          fileType: 'txt',
          tags: []
        }
      ]
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
        }
      ]
    }
  ],
  files: [
    {
      id: 'rootfile1',
      name: 'Root File 1',
      description: 'A file in Root',
      mimeType: 'video/mp4',
      fileType: 'mp4',
      tags: []
    }
  ]
};

// ---------------- Helper Functions ----------------
function getFolderByPath(fs: any, path: string[]) {
  let current = fs;
  for (let i = 1; i < path.length; i++) {
    current = current.folders.find((f: any) => f.id === path[i]);
    if (!current) return null;
  }
  return current;
}

function updateFolderInFS(fs: any, path: string[], updater: (folder: any) => any) {
  if (path.length === 1) {
    return updater(fs);
  }
  return {
    ...fs,
    folders: fs.folders.map((folder: any) =>
      folder.id === path[1]
        ? updateFolderInFS(folder, path.slice(1), updater)
        : folder
    )
  };
}

function findFileInFS(fs: any, fileId: string): { folder: any; file: any } | null {
  for (let file of fs.files) {
    if (file.id === fileId) return { folder: fs, file };
  }
  for (let folder of fs.folders) {
    const result = findFileInFS(folder, fileId);
    if (result) return result;
  }
  return null;
}

function findFolderPath(fs: any, folderId: string, currentPath: string[] = ['root']): string[] | null {
  if (fs.id === folderId) return currentPath;
  for (let folder of fs.folders) {
    const result = findFolderPath(folder, folderId, [...currentPath, folder.id]);
    if (result) return result;
  }
  return null;
}

// -------------------- Drag-and-Drop Handler --------------------
function processDropItem(prevFS: any, targetPath: string[], itemDataJson: string) {
  const data = JSON.parse(itemDataJson);
  if (data.type === 'file') {
    const result = findFileInFS(prevFS, data.id);
    if (!result) return prevFS;
    const { folder: sourceFolder, file } = result;
    const target = getFolderByPath(prevFS, targetPath);
    if (!target) return prevFS;
    if (sourceFolder.id === target.id) return prevFS;
    const sourcePath = findFolderPath(prevFS, sourceFolder.id);
    let newFS = updateFolderInFS(prevFS, sourcePath!, (folder: any) => ({
      ...folder,
      files: folder.files.filter((f: any) => f.id !== data.id)
    }));
    newFS = updateFolderInFS(newFS, targetPath, (folder: any) => ({
      ...folder,
      files: [...folder.files, file]
    }));
    return newFS;
  } else if (data.type === 'folder') {
    const sourcePath = findFolderPath(prevFS, data.id);
    if (!sourcePath || sourcePath.length < 2) return prevFS;
    if (targetPath.includes(data.id)) return prevFS;
    const folderToMove = getFolderByPath(prevFS, sourcePath);
    if (!folderToMove) return prevFS;
    const parentPath = sourcePath.slice(0, -1);
    let newFS = updateFolderInFS(prevFS, parentPath, (parentFolder: any) => ({
      ...parentFolder,
      folders: parentFolder.folders.filter((f: any) => f.id !== data.id)
    }));
    newFS = updateFolderInFS(newFS, targetPath, (targetFolder: any) => ({
      ...targetFolder,
      folders: [...targetFolder.folders, folderToMove]
    }));
    return newFS;
  }
  return prevFS;
}

// -------------------- Tag Update Helper Functions --------------------
function updateFileTags(fs: any, fileId: string, newTags: string[]) {
  const result = findFileInFS(fs, fileId);
  if (!result) return fs;
  const { folder, file } = result;
  const updatedFile = { ...file, tags: newTags };
  const folderPath = findFolderPath(fs, folder.id);
  return updateFolderInFS(fs, folderPath!, (folder: any) => ({
    ...folder,
    files: folder.files.map((f: any) => (f.id === fileId ? updatedFile : f))
  }));
}

function updateFolderTags(fs: any, folderId: string, newTags: string[]) {
  const folderPath = findFolderPath(fs, folderId);
  if (!folderPath) return fs;
  return updateFolderInFS(fs, folderPath, (folder: any) => ({
    ...folder,
    tags: newTags
  }));
}

function updateItemTags(fs: any, item: any, newTags: string[]) {
  if (item.mimeType !== undefined && item.fileType !== undefined) {
    return updateFileTags(fs, item.id, newTags);
  } else {
    return updateFolderTags(fs, item.id, newTags);
  }
}

// ===================== Main App Component =====================
function FileBrowser() {
  // ---------------- Global File System State ----------------
  const [fileSystem, setFileSystem] = useState(initialFileSystem);
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [backStack, setBackStack] = useState<string[][]>([]);
  const [forwardStack, setForwardStack] = useState<string[][]>([]);
  const currentFolder = getFolderByPath(fileSystem, currentPath);

  // ---------------- Navigation Handlers ----------------
  const handleBreadcrumbSelect = (newPath: string[]) => {
    if (JSON.stringify(newPath) !== JSON.stringify(currentPath)) {
      setBackStack([...backStack, currentPath]);
      setForwardStack([]);
      setCurrentPath(newPath);
    }
  };

  const handleSelectFolder = (newPath: string[]) => {
    if (JSON.stringify(newPath) !== JSON.stringify(currentPath)) {
      setBackStack([...backStack, currentPath]);
      setForwardStack([]);
      setCurrentPath(newPath);
    }
  };

  const handleOpenFolderFromContents = (folderId: string) => {
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

  // -------------------- View Mode & Split View State --------------------
  const [viewModes, setViewModes] = useState<any>({});
  const currentViewMode = currentFolder ? viewModes[currentFolder.id] || 'icons' : 'icons';
  const handleChangeViewMode = (mode: string) => {
    if (currentFolder) {
      setViewModes({ ...viewModes, [currentFolder.id]: mode });
    }
  };

  const [splitView, setSplitView] = useState(false);
  const [targetPath, setTargetPath] = useState<string[]>(['root']);
  const targetFolder = getFolderByPath(fileSystem, targetPath);
  const [targetViewModes, setTargetViewModes] = useState<any>({});
  const targetViewMode = targetFolder ? targetViewModes[targetFolder.id] || 'icons' : 'icons';

  const toggleSplitView = () => {
    setSplitView(!splitView);
  };

  // -------------------- Target Navigation State --------------------
  const [targetBackStack, setTargetBackStack] = useState<string[][]>([]);
  const [targetForwardStack, setTargetForwardStack] = useState<string[][]>([]);
  const handleTargetBreadcrumbSelect = (newPath: string[]) => {
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

  // -------------------- File Preview & Operation State --------------------
  const [previewFile, setPreviewFile] = useState<any>(null);
  const handleFilePreview = (file: any) => setPreviewFile(file);
  const closeFilePreview = () => setPreviewFile(null);

  const [selectedSourceFile, setSelectedSourceFile] = useState<any>(null);
  const [selectedTargetFile, setSelectedTargetFile] = useState<any>(null);

  const handleCopyFileSourceToTarget = () => {
    if (!selectedSourceFile) return;
    setFileSystem((prevFS) => {
      const target = getFolderByPath(prevFS, targetPath);
      if (!target) return prevFS;
      // Copy file with a new id.
      const newFile = { ...selectedSourceFile, id: Date.now().toString() };
      const updatedTarget = {
        ...target,
        files: [...target.files, newFile]
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
        files: source.files.filter((f: any) => f.id !== selectedSourceFile.id)
      };
      const updatedTarget = {
        ...target,
        files: [...target.files, selectedSourceFile]
      };
      let newFS = updateFolderInFS(prevFS, currentPath, () => updatedSource);
      newFS = updateFolderInFS(newFS, targetPath, () => updatedTarget);
      return newFS;
    });
    setSelectedSourceFile(null);
  };

  const handleCopyFileTargetToSource = () => {
    if (!selectedTargetFile) return;
    setFileSystem((prevFS) => {
      const source = getFolderByPath(prevFS, currentPath);
      if (!source) return prevFS;
      const newFile = { ...selectedTargetFile, id: Date.now().toString() };
      const updatedSource = {
        ...source,
        files: [...source.files, newFile]
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
        files: target.files.filter((f: any) => f.id !== selectedTargetFile.id)
      };
      const updatedSource = {
        ...source,
        files: [...source.files, selectedTargetFile]
      };
      let newFS = updateFolderInFS(prevFS, targetPath, () => updatedTarget);
      newFS = updateFolderInFS(newFS, currentPath, () => updatedSource);
      return newFS;
    });
    setSelectedTargetFile(null);
  };

  // -------------------- Drag and Drop Handler --------------------
  const handleDropItem = (dropTargetPath: string[], itemDataJson: string) => {
    setFileSystem((prevFS) => processDropItem(prevFS, dropTargetPath, itemDataJson));
  };

  // -------------------- Context Menu State --------------------
  const [contextMenu, setContextMenu] = useState<any>(null);
  const handleFileContextMenu = (file: any, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, file });
  };
  const closeContextMenu = () => setContextMenu(null);
  const handleContextOpen = (file: any) => {
    handleFilePreview(file);
    closeContextMenu();
  };
  const handleContextCopy = (file: any) => {
    console.log('Copy file:', file);
    closeContextMenu();
  };
  const handleContextMove = (file: any) => {
    console.log('Move file:', file);
    closeContextMenu();
  };

  // -------------------- Tag Handler & Create Tag Popup --------------------
  const handleTagItem = (item: any, newTags: string[]) => {
    setFileSystem((prevFS) => updateItemTags(prevFS, item, newTags));
  };

  const [availableTags, setAvailableTags] = useState<any>([
    { name: 'Important', color: '#ff0000', type: '' },
    { name: 'Work', color: '#0000ff', type: '' },
    { name: 'Personal', color: '#00ff00', type: '' }
  ]);
  const [showCreateTagPopup, setShowCreateTagPopup] = useState(false);

  // When the global "Create Tag" button is pressed.
  const handleCreateTag = () => {
    setShowCreateTagPopup(true);
  };

  // Called when the CreateTagPopup saves a new tag.
  const handleSaveTag = (tagData: TagData) => {
    if (!availableTags.find((t: any) => t.name === tagData.name)) {
      setAvailableTags([...availableTags, tagData]);
    }
    // If a file is selected, update its tags; otherwise update the current folder.
    if (selectedSourceFile) {
      const newTags = selectedSourceFile.tags ? [...selectedSourceFile.tags, tagData.name] : [tagData.name];
      handleTagItem(selectedSourceFile, newTags);
      setSelectedSourceFile(null);
    } else if (currentFolder) {
      const newTags = currentFolder.tags ? [...currentFolder.tags, tagData.name] : [tagData.name];
      handleTagItem(currentFolder, newTags);
    }
    setShowCreateTagPopup(false);
  };

  const handleCancelTag = () => {
    setShowCreateTagPopup(false);
  };

  // Toggle a tag for the current folder.
  const handleToggleTag = (tagName: string) => {
    if (!currentFolder) return;
    const newTags = currentFolder.tags.includes(tagName)
      ? currentFolder.tags.filter((t: string) => t !== tagName)
      : [...currentFolder.tags, tagName];
    handleTagItem(currentFolder, newTags);
  };

  // -------------------- Render JSX --------------------
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      }}
    >
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
        createTag={handleCreateTag}
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
              onChangeTargetViewMode={(mode: string) => {
                if (targetFolder)
                  setTargetViewModes({ ...targetViewModes, [targetFolder.id]: mode });
              }}
              onSourceFileSelect={(file: any) => setSelectedSourceFile(file)}
              selectedSourceFile={selectedSourceFile}
              onTargetFileSelect={(file: any) => setSelectedTargetFile(file)}
              selectedTargetFile={selectedTargetFile}
              onFilePreview={handleFilePreview}
              onCopyFileSourceToTarget={handleCopyFileSourceToTarget}
              onMoveFileSourceToTarget={handleMoveFileSourceToTarget}
              onCopyFileTargetToSource={handleCopyFileTargetToSource}
              onMoveFileTargetToSource={handleMoveFileTargetToSource}
              onSelectTargetFolder={(folderId: string) => setTargetPath([...targetPath, folderId])}
              targetPath={targetPath}
              sourceCurrentPath={currentPath}
              sourceBackStack={backStack}
              sourceForwardStack={forwardStack}
              onSourceBreadcrumbSelect={handleBreadcrumbSelect}
              onSourceBack={handleBack}
              onSourceForward={handleForward}
              onSourceReload={handleReload}
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
              availableTags={availableTags}
              currentFolder={currentFolder}
              currentPath={currentPath}
              onOpenFolder={handleOpenFolderFromContents}
              viewMode={currentViewMode}
              onChangeViewMode={handleChangeViewMode}
              onFileClick={handleFilePreview}
              onSelectFile={(file: any) => setSelectedSourceFile(file)}
              selectedFileId={selectedSourceFile ? selectedSourceFile.id : null}
              onFileContextMenu={handleFileContextMenu}
              onDropItem={handleDropItem}
              onTagItem={handleTagItem}
            />
          )}
        </div>
      </div>

      {/* Create Tag Popup */}
      {showCreateTagPopup && (
        <CreateTagPopup
          onSave={handleSaveTag}
          onCancel={handleCancelTag}
          targetFile={selectedSourceFile}
        />
      )}

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

export default FileBrowser;
