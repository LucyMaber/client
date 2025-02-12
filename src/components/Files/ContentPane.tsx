import React, { useState, useEffect } from 'react';
import { FolderIcon, FileIcon } from './Icons';
import TagSelector from '../Tagg/TagSelector';
import { TagData } from '../../types/TagData';

const paneContainerStyle: React.CSSProperties = { padding: '20px' };

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  minWidth: '300px',
};

interface ContentPaneProps {
  currentFolder: any;
  currentPath: string[];
  onOpenFolder: (folderId: string) => void;
  viewMode: string;
  onChangeViewMode: (mode: string) => void;
  onFileClick: (file: any) => void;
  onSelectFile: (file: any) => void;
  selectedFileId: string | null;
  onFileContextMenu?: (file: any, event: React.MouseEvent) => void;
  onDropItem: (targetPath: string[], itemDataJson: string) => void;
  onTagItem: (item: any, newTags: string[]) => void;
  availableTags: TagData[];
}

function ContentPane({
  currentFolder,
  currentPath,
  onOpenFolder,
  viewMode,
  onChangeViewMode,
  onFileClick,
  onSelectFile,
  selectedFileId,
  onFileContextMenu,
  onDropItem,
  onTagItem,
  availableTags,
}: ContentPaneProps) {
  const [taggingItem, setTaggingItem] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (taggingItem) {
      const initialTags = taggingItem.tags || [];
      setSelectedTags(initialTags);
    }
  }, [taggingItem]);

  if (!currentFolder) {
    return (
      <div style={{ padding: '20px', fontSize: '1.2rem', color: '#888' }}>
        Folder not found.
      </div>
    );
  }

  const formatExtension = (fileType: string) =>
    fileType ? (fileType.startsWith('.') ? fileType : '.' + fileType) : '';

  const renderTags = (item: any) => {
    const tags = item.tags && item.tags.length ? item.tags.join(', ') : '';
    return (
      <span
        onClick={(e) => {
          e.stopPropagation();
          setTaggingItem(item);
        }}
        style={{
          marginLeft: '5px',
          color: '#4e54c8',
          cursor: 'pointer',
          fontSize: '0.8rem'
        }}
      >
        {tags || 'Add Tag'}
      </span>
    );
  };

  const fileTooltip = (file: any) => {
    const fileTags = file.tags && file.tags.length ? file.tags.join(', ') : 'None';
    const fileDesc = file.description || '';
    return `${file.name} (${formatExtension(file.fileType)})\nTags: ${fileTags}\nDescription: ${fileDesc}`;
  };

  const viewModeControls = (
    <div style={{ marginBottom: '15px' }}>
      <span style={{ marginRight: '10px', fontWeight: 'bold' }}>View Mode:</span>
      {['icons', 'details', 'compact'].map((mode) => (
        <button
          key={mode}
          disabled={viewMode === mode}
          onClick={() => onChangeViewMode(mode)}
          style={{
            marginRight: '5px',
            padding: '6px 10px',
            border: 'none',
            borderRadius: '4px',
            background: viewMode === mode ? '#4e54c8' : '#eee',
            color: viewMode === mode ? '#fff' : '#333',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  );

  const fileItemProps = (file: any) => ({
    draggable: true,
    title: fileTooltip(file),
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({ type: 'file', id: file.id })
      );
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      onFileContextMenu && onFileContextMenu(file, e);
    }
  });

  const folderItemProps = (folder: any) => ({
    draggable: true,
    title: `${folder.name}\nTags: ${folder.tags && folder.tags.length ? folder.tags.join(', ') : 'None'}`,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({ type: 'folder', id: folder.id })
      );
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault()
  });

  let content;
  if (viewMode === 'icons') {
    content = (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {currentFolder.folders.map((folder: any) => (
          <div
            key={folder.id}
            {...folderItemProps(folder)}
            style={{
              width: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onDoubleClick={() => onOpenFolder(folder.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const itemData = e.dataTransfer.getData('application/json');
              onDropItem([...currentPath, folder.id], itemData);
            }}
          >
            <div style={{ fontSize: '48px' }}>
              <FolderIcon style={{ fontSize: '48px' }} />
            </div>
            <div>{folder.name}</div>
            <div>{renderTags(folder)}</div>
          </div>
        ))}
        {currentFolder.files.map((file: any) => (
          <div
            key={file.id}
            {...fileItemProps(file)}
            style={{
              width: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              border: selectedFileId === file.id ? '2px solid #4e54c8' : 'none',
              borderRadius: '4px',
              transition: 'transform 0.2s'
            }}
            onClick={() => onSelectFile(file)}
            onDoubleClick={() => onFileClick(file)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{ fontSize: '48px' }}>
              <FileIcon style={{ fontSize: '48px' }} mimeType={file.mimeType} fileType={file.fileType} />
            </div>
            <div>{file.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>
              {formatExtension(file.fileType)}
            </div>
            <div>{renderTags(file)}</div>
          </div>
        ))}
      </div>
    );
  } else if (viewMode === 'details') {
    content = (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f7f7f7' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Extension</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Mime Type</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Tags</th>
            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {currentFolder.folders.map((folder: any) => (
            <tr
              key={folder.id}
              {...folderItemProps(folder)}
              style={{ cursor: 'pointer', transition: 'background 0.3s' }}
              onDoubleClick={() => onOpenFolder(folder.id)}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f0f0f0'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const itemData = e.dataTransfer.getData('application/json');
                onDropItem([...currentPath, folder.id], itemData);
              }}
            >
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{folder.name}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>Folder</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{renderTags(folder)}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
            </tr>
          ))}
          {currentFolder.files.map((file: any) => (
            <tr
              key={file.id}
              {...fileItemProps(file)}
              style={{
                cursor: 'pointer',
                background: selectedFileId === file.id ? '#e0edff' : 'transparent',
                transition: 'background 0.3s'
              }}
              onClick={() => onSelectFile(file)}
              onDoubleClick={() => onFileClick(file)}
              onMouseOver={(e) => { if (selectedFileId !== file.id) e.currentTarget.style.background = '#f9f9f9'; }}
              onMouseOut={(e) => { if (selectedFileId !== file.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{file.name}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>File</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatExtension(file.fileType)}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{file.mimeType}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{renderTags(file)}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{file.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (viewMode === 'compact') {
    content = (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {currentFolder.folders.map((folder: any) => (
          <li
            key={folder.id}
            {...folderItemProps(folder)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderBottom: '1px solid #eee',
              transition: 'background 0.3s'
            }}
            onDoubleClick={() => onOpenFolder(folder.id)}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f9f9f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const itemData = e.dataTransfer.getData('application/json');
              onDropItem([...currentPath, folder.id], itemData);
            }}
          >
            <FolderIcon style={{ marginRight: '5px' }} /> {folder.name} {renderTags(folder)}
          </li>
        ))}
        {currentFolder.files.map((file: any) => (
          <li
            key={file.id}
            {...fileItemProps(file)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderBottom: '1px solid #eee',
              background: selectedFileId === file.id ? '#e0edff' : 'transparent',
              transition: 'background 0.3s, transform 0.2s'
            }}
            onClick={() => onSelectFile(file)}
            onDoubleClick={() => onFileClick(file)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <FileIcon style={{ marginRight: '5px' }} mimeType={file.mimeType} fileType={file.fileType} /> {file.name}{' '}
            <span style={{ color: '#888', fontSize: '0.9rem' }}>
              ({formatExtension(file.fileType)}) {renderTags(file)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  const handleBlankDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData('application/json');
    onDropItem(currentPath, itemData);
  };

  const handleTagSave = () => {
    onTagItem && onTagItem(taggingItem, selectedTags);
    setTaggingItem(null);
    setSelectedTags([]);
  };

  const handleTagCancel = () => {
    setTaggingItem(null);
    setSelectedTags([]);
  };

  const handleToggleTag = (tagName: string) => {
    let newSelectedTags: string[];
    if (selectedTags.includes(tagName)) {
      newSelectedTags = selectedTags.filter((t) => t !== tagName);
    } else {
      newSelectedTags = [...selectedTags, tagName];
    }
    setSelectedTags(newSelectedTags);
  };

  return (
    <div style={paneContainerStyle} onDragOver={(e) => e.preventDefault()} onDrop={handleBlankDrop}>
      <h3 style={{ borderBottom: '2px solid #4e54c8', paddingBottom: '5px', color: '#4e54c8' }}>
        {currentFolder.name}
      </h3>
      {viewModeControls}
      {content}
      {/* Tag Editing Modal */}
      {taggingItem && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h4>Edit Tags for {taggingItem.name}</h4>
            <TagSelector
              availableTags={availableTags}
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
            />
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <button onClick={handleTagSave} style={{ marginRight: '10px' }}>
                Save
              </button>
              <button onClick={handleTagCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentPane;
