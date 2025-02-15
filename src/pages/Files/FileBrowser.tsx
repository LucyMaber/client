// FileBrowser.tsx
import React, { useState } from "react";
import axios from "axios";
import NavigationBar from "../../components/Files/NavigationBar";
import NavigationPane from "../../components/Files/NavigationPane";
import SplitView from "../../components/Files/SplitView";
import ContentPane from "../../components/Files/ContentPane";
import FilePreviewModal from "../../components/Files/FilePreviewModal";
import ContextMenu from "../../components/Files/ContextMenu";
import CreateTagPopup from "../../components/Tagg/CreateTagPopup";
import { TagData } from "../../types/TagData";
import { useFileSystem, FileEntry } from "../../providers/FileSystemProvider";
import { BreadcrumbData } from "../../types/Breadcrumb";

// Utility to convert a path string (e.g. "/folder/subfolder") into breadcrumb objects.
const getBreadcrumbs = (path: string): BreadcrumbData[] => {
  const parts = path.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbData[] = [{ label: "Root", path: "/" }];
  let cumulativePath = "";
  parts.forEach((part) => {
    cumulativePath += "/" + part;
    breadcrumbs.push({ label: part, path: cumulativePath });
  });
  return breadcrumbs;
};

function FileBrowser() {
  // Use the file system provider.
  const {
    currentPath: fsPath,
    files,
    chdir,
    refresh,
    copyFile,
    moveFile,
  } = useFileSystem();

  // Ensure files is always an array.
  const safeFiles: FileEntry[] = Array.isArray(files) ? files : [];

  // Navigation history for the primary view.
  const [backStack, setBackStack] = useState<string[]>([]);
  const [forwardStack, setForwardStack] = useState<string[]>([]);

  // Create a folder-like object from the flat file list.
  const currentFolder = {
    id: fsPath,
    name: fsPath === "/" ? "Root" : fsPath,
    folders: safeFiles.filter((entry: FileEntry) => entry.type === "folder"),
    files: safeFiles.filter((entry: FileEntry) => entry.type === "file"),
    taggs: [] as string[],
  };

  // --- Navigation Handlers for the Primary Pane ---
  const handleBreadcrumbSelect = (breadcrumbs: BreadcrumbData[]) => {
    const newPath = breadcrumbs[breadcrumbs.length - 1].path;
    if (newPath !== fsPath) {
      setBackStack([...backStack, fsPath]);
      setForwardStack([]);
      chdir(newPath);
    }
  };

  const handleBack = () => {
    if (!backStack.length) return;
    const previous = backStack[backStack.length - 1];
    setBackStack(backStack.slice(0, -1));
    setForwardStack([fsPath, ...forwardStack]);
    chdir(previous);
  };

  const handleForward = () => {
    if (!forwardStack.length) return;
    const next = forwardStack[0];
    setForwardStack(forwardStack.slice(1));
    setBackStack([...backStack, fsPath]);
    chdir(next);
  };

  const handleReload = () => {
    refresh();
  };

  // --- View Mode & Split View State ---
  const [viewModes, setViewModes] = useState<Record<string, string>>({});
  const currentViewMode = viewModes[currentFolder.id] || "icons";
  const handleChangeViewMode = (mode: string) => {
    setViewModes({ ...viewModes, [currentFolder.id]: mode });
  };

  const [splitView, setSplitView] = useState<boolean>(false);
  const toggleSplitView = () => setSplitView((prev) => !prev);

  // --- Target Pane Navigation State (for Split View) ---
  const [targetPath, setTargetPath] = useState<string>("/");
  const [targetBackStack, setTargetBackStack] = useState<string[]>([]);
  const [targetForwardStack, setTargetForwardStack] = useState<string[]>([]);

  // For this example, targetFolder uses the same file list.
  const targetFolder = {
    id: targetPath,
    name: targetPath === "/" ? "Root" : targetPath,
    folders: safeFiles.filter((entry: FileEntry) => entry.type === "folder"),
    files: safeFiles.filter((entry: FileEntry) => entry.type === "file"),
  };

  // For target pane breadcrumb selection.
  const handleTargetBreadcrumbSelect = (newPath: string) => {
    if (newPath !== targetPath) {
      setTargetBackStack([...targetBackStack, targetPath]);
      setTargetForwardStack([]);
      setTargetPath(newPath);
    }
  };

  const handleTargetBack = () => {
    if (!targetBackStack.length) return;
    const previous = targetBackStack[targetBackStack.length - 1];
    setTargetBackStack(targetBackStack.slice(0, -1));
    setTargetForwardStack([targetPath, ...targetForwardStack]);
    setTargetPath(previous);
  };

  const handleTargetForward = () => {
    if (!targetForwardStack.length) return;
    const next = targetForwardStack[0];
    setTargetForwardStack(targetForwardStack.slice(1));
    setTargetBackStack([...targetBackStack, targetPath]);
    setTargetPath(next);
  };

  const handleTargetReload = () => {
    setTargetPath(targetPath);
  };

  // --- File Preview & File Operation State ---
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);
  const handleFilePreview = (file: FileEntry) => setPreviewFile(file);
  const closeFilePreview = () => setPreviewFile(null);

  const [selectedSourceFile, setSelectedSourceFile] =
    useState<FileEntry | null>(null);
  const [selectedTargetFile, setSelectedTargetFile] =
    useState<FileEntry | null>(null);

  // --- File Copy/Move Operations ---
  const handleCopyFileSourceToTarget = async () => {
    if (!selectedSourceFile) return;
    try {
      await copyFile(selectedSourceFile.path, targetPath);
      refresh();
    } catch (error) {
      console.error("Error copying file from source to target:", error);
    }
    setSelectedSourceFile(null);
  };

  const handleMoveFileSourceToTarget = async () => {
    if (!selectedSourceFile) return;
    try {
      await moveFile(selectedSourceFile.path, targetPath);
      refresh();
    } catch (error) {
      console.error("Error moving file from source to target:", error);
    }
    setSelectedSourceFile(null);
  };

  const handleCopyFileTargetToSource = async () => {
    if (!selectedTargetFile) return;
    try {
      await copyFile(selectedTargetFile.path, fsPath);
      refresh();
    } catch (error) {
      console.error("Error copying file from target to source:", error);
    }
    setSelectedTargetFile(null);
  };

  const handleMoveFileTargetToSource = async () => {
    if (!selectedTargetFile) return;
    try {
      await moveFile(selectedTargetFile.path, fsPath);
      refresh();
    } catch (error) {
      console.error("Error moving file from target to source:", error);
    }
    setSelectedTargetFile(null);
  };

  // --- Drag & Drop Handler ---
  const handleDropItem = (dropTargetPath: string, itemDataJson: string) => {
    console.log("Dropped item on", dropTargetPath, itemDataJson);
    refresh();
  };

  // --- Context Menu State & Handlers ---
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileEntry;
  } | null>(null);
  const handleFileContextMenu = (file: FileEntry, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, file });
  };
  const closeContextMenu = () => setContextMenu(null);
  const handleContextOpen = (file: FileEntry) => {
    handleFilePreview(file);
    closeContextMenu();
  };
  const handleContextCopy = (file: FileEntry) => {
    console.log("Context copy file:", file);
    closeContextMenu();
  };
  const handleContextMove = (file: FileEntry) => {
    console.log("Context move file:", file);
    closeContextMenu();
  };

  const [availableTags, setAvailableTags] = useState<TagData[]>([
    { name: "Important", color: "#ff0000", type: "generic", related: [] },
    { name: "Work", color: "#0000ff", type: "generic", related: [] },
    { name: "Personal", color: "#00ff00", type: "generic", related: [] },
  ]);
  const [showCreateTagPopup, setShowCreateTagPopup] = useState<boolean>(false);

  const handleCreateTag = () => setShowCreateTagPopup(true);

  const handleSaveTag = (tagData: TagData) => {
    if (!availableTags.find((t) => t.name === tagData.name)) {
      setAvailableTags([...availableTags, tagData]);
    }
    if (selectedSourceFile) {
      const newTags: TagData[] = selectedSourceFile.tags
        ? [
            ...selectedSourceFile.tags.map((tag) =>
              typeof tag === "string"
                ? availableTags.find((t) => t.name === tag) || {
                    name: tag,
                    color: "#000000",
                    type: "generic" as const,
                    related: [],
                  }
                : tag
            ),
            tagData,
          ]
        : [tagData];
      handleTagItem(selectedSourceFile, newTags);
      setSelectedSourceFile(null);
    } else {
      handleTagItem(currentFolder, tagData.name ? [tagData] : []);
    }
    setShowCreateTagPopup(false);
  };

  const handleCancelTag = () => setShowCreateTagPopup(false);

  // --- Breadcrumbs for both Panes ---
  const breadcrumbs: BreadcrumbData[] = getBreadcrumbs(fsPath);

  function handleTagItem(item: any, newTags: TagData[]): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
      <NavigationBar
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        canGoBack={backStack.length > 0}
        canGoForward={forwardStack.length > 0}
        fileSystem={currentFolder}
        onToggleSplitView={toggleSplitView}
        splitView={splitView}
        createTag={handleCreateTag}
        breadcrumbs={breadcrumbs}
        onBreadcrumbSelect={handleBreadcrumbSelect}
        currentPath={[fsPath]}
      />

      <div style={{ display: "flex", flex: 1 }}>
        <div
          style={{
            width: "250px",
            borderRight: "1px solid #eee",
            overflowY: "auto",
          }}
        >
          <NavigationPane
            fileSystem={currentFolder}
            breadcrumbs={breadcrumbs}
            onSelectFolder={(crumbs: BreadcrumbData[]) =>
              handleBreadcrumbSelect(crumbs)
            }
            currentPath={breadcrumbs}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {splitView ? (
            <SplitView
              sourceFolder={fsPath}
              targetFolder={targetPath}
              sourceViewMode={currentViewMode}
              targetViewMode={viewModes[targetPath] || "icons"}
              onChangeSourceViewMode={handleChangeViewMode}
              onChangeTargetViewMode={(mode: string) =>
                setViewModes({ ...viewModes, [targetPath]: mode })
              }
              onSourceFileSelect={(file: FileEntry) =>
                setSelectedSourceFile(file)
              }
              selectedSourceFile={selectedSourceFile}
              onTargetFileSelect={(file: FileEntry) =>
                setSelectedTargetFile(file)
              }
              selectedTargetFile={selectedTargetFile}
              onFilePreview={handleFilePreview}
              onCopyFileSourceToTarget={handleCopyFileSourceToTarget}
              onMoveFileSourceToTarget={handleMoveFileSourceToTarget}
              onCopyFileTargetToSource={handleCopyFileTargetToSource}
              onMoveFileTargetToSource={handleMoveFileTargetToSource}
              onSelectTargetFolder={(folderPath: string) =>
                setTargetPath(folderPath)
              }
              onSourceBack={handleBack}
              onSourceForward={handleForward}
              onSourceReload={handleReload}
              onTargetBack={handleTargetBack}
              onTargetForward={handleTargetForward}
              onTargetReload={handleTargetReload}
              sourceCurrentPath={[fsPath]}
              sourceBackStack={[backStack]}
              onSourceBreadcrumbSelect={handleBreadcrumbSelect}
              targetCurrentPath={[targetPath]}
              targetBackStack={[targetBackStack]}
              targetForwardStack={[targetForwardStack]}
              onTargetBreadcrumbSelect={(breadcrumbs: BreadcrumbData[]) => {
                const newPath = breadcrumbs[breadcrumbs.length - 1].path;
                handleTargetBreadcrumbSelect(newPath);
              }}
              sourceForwardStack={[]}
              fileSystem={undefined}
            />
          ) : (
            <ContentPane
              availableTags={availableTags}
              currentFolder={currentFolder}
              currentPath={[fsPath]}
              onOpenFolder={(folderPath: string) => chdir(folderPath)}
              viewMode={currentViewMode}
              onChangeViewMode={handleChangeViewMode}
              onFileClick={handleFilePreview}
              onSelectFile={(file: FileEntry) => setSelectedSourceFile(file)}
              selectedFileId={
                selectedSourceFile ? selectedSourceFile.path : null
              }
              onFileContextMenu={handleFileContextMenu}
              onDropItem={(targetPathArray: string[], itemDataJson: string) =>
                handleDropItem(targetPathArray.join("/"), itemDataJson)
              }
              onTagItem={function (item: any, newTags: string[]): void {
                throw new Error("Function not implemented.");
              }}
            />
          )}
        </div>
      </div>

      {showCreateTagPopup && (
        <CreateTagPopup
          onCancel={handleCancelTag}
          onSubmit={handleSaveTag}
          targetFile={selectedSourceFile}
        />
      )}

      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={closeFilePreview} />
      )}

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
