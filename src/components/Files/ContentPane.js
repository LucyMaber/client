import React from 'react';
import { FolderIcon, FileIcon } from './Icons'; // Adjust the path if needed

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
  onTagFile, // New prop: callback when a file’s tag area is clicked
}) {
  if (!currentFolder)
    return (
      <div style={{ padding: '20px', fontSize: '1.2rem', color: '#888' }}>
        Folder not found.
      </div>
    );

  const paneContainer = { padding: '20px' };

  // Helper to format file extension (ensures it starts with a dot)
  const formatExtension = (fileType) => {
    return fileType ? (fileType.startsWith('.') ? fileType : '.' + fileType) : '';
  };

  // Helper to render file tags.
  // If the file has tags, they will be joined by a comma.
  // If no tags exist and onTagFile is provided, "Add Tag" is shown.
  // Clicking the tags area will invoke onTagFile with the file.
  const renderTags = (file) => {
    const tags = file.tags && file.tags.length ? file.tags.join(', ') : '';
    if (onTagFile) {
      return (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onTagFile(file);
          }}
          style={{
            marginLeft: '5px',
            color: '#4e54c8',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          {tags || 'Add Tag'}
        </span>
      );
    }
    return (
      <span style={{ marginLeft: '5px', fontSize: '0.8rem', color: '#555' }}>
        {tags}
      </span>
    );
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
            transition: 'background 0.3s',
          }}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  );

  // For files, add drag and context menu events and a tooltip showing file extension.
  const fileItemProps = (file) => ({
    draggable: true,
    title: `${file.name} (${formatExtension(file.fileType)})`,
    onDragStart: (e) =>
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({ type: 'file', id: file.id })
      ),
    onContextMenu: (e) => {
      e.preventDefault();
      onFileContextMenu && onFileContextMenu(file, e);
    },
  });

  // For folders, add similar drag events.
  const folderItemProps = (folder) => ({
    draggable: true,
    onDragStart: (e) =>
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({ type: 'folder', id: folder.id })
      ),
    onContextMenu: (e) => e.preventDefault(), // Optionally add folder-specific context menu
  });

  let content;
  if (viewMode === 'icons') {
    content = (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {currentFolder.folders.map((folder) => (
          <div
            key={folder.id}
            {...folderItemProps(folder)}
            style={{
              width: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onDoubleClick={() => onOpenFolder(folder.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const itemData = e.dataTransfer.getData('application/json');
              // When dropping on a folder, target path is currentPath + folder.id
              onDropItem && onDropItem([...currentPath, folder.id], itemData);
            }}
          >
            <div style={{ fontSize: '48px' }}>
              <FolderIcon style={{ fontSize: '48px' }} />
            </div>
            <div>{folder.name}</div>
          </div>
        ))}
        {currentFolder.files.map((file) => (
          <div
            key={file.id}
            {...fileItemProps(file)}
            style={{
              width: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              border: selectedFileId === file.id ? '2px solid #4e54c8' : 'none',
              borderRadius: '4px',
              transition: 'transform 0.2s',
            }}
            onClick={() => onSelectFile(file)}
            onDoubleClick={() => onFileClick(file)}
            // Add hover effect to "highlight" the file.
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: '48px' }}>
              <FileIcon
                style={{ fontSize: '48px' }}
                mimeType={file.mimeType}
                fileType={file.fileType}
              />
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
          {currentFolder.folders.map((folder) => (
            <tr
              key={folder.id}
              {...folderItemProps(folder)}
              style={{ cursor: 'pointer', transition: 'background 0.3s' }}
              onDoubleClick={() => onOpenFolder(folder.id)}
              onMouseOver={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const itemData = e.dataTransfer.getData('application/json');
                onDropItem && onDropItem([...currentPath, folder.id], itemData);
              }}
            >
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {folder.name}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>Folder</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}></td>
            </tr>
          ))}
          {currentFolder.files.map((file) => (
            <tr
              key={file.id}
              {...fileItemProps(file)}
              style={{
                cursor: 'pointer',
                background: selectedFileId === file.id ? '#e0edff' : 'transparent',
                transition: 'background 0.3s',
              }}
              onClick={() => onSelectFile(file)}
              onDoubleClick={() => onFileClick(file)}
              // Optionally add hover effects for details view as well.
              onMouseOver={(e) => {
                if (selectedFileId !== file.id) {
                  e.currentTarget.style.background = '#f9f9f9';
                }
              }}
              onMouseOut={(e) => {
                if (selectedFileId !== file.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {file.name}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>File</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {formatExtension(file.fileType)}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {file.mimeType}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {renderTags(file)}
              </td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                {file.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (viewMode === 'compact') {
    content = (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {currentFolder.folders.map((folder) => (
          <li
            key={folder.id}
            {...folderItemProps(folder)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderBottom: '1px solid #eee',
              transition: 'background 0.3s',
            }}
            onDoubleClick={() => onOpenFolder(folder.id)}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f9f9f9')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const itemData = e.dataTransfer.getData('application/json');
              onDropItem && onDropItem([...currentPath, folder.id], itemData);
            }}
          >
            <FolderIcon style={{ marginRight: '5px' }} /> {folder.name}
          </li>
        ))}
        {currentFolder.files.map((file) => (
          <li
            key={file.id}
            {...fileItemProps(file)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderBottom: '1px solid #eee',
              background: selectedFileId === file.id ? '#e0edff' : 'transparent',
              transition: 'background 0.3s, transform 0.2s',
            }}
            onClick={() => onSelectFile(file)}
            onDoubleClick={() => onFileClick(file)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FileIcon
              style={{ marginRight: '5px' }}
              mimeType={file.mimeType}
              fileType={file.fileType}
            />{' '}
            {file.name}{' '}
            <span style={{ color: '#888', fontSize: '0.9rem' }}>
              ({formatExtension(file.fileType)}) {renderTags(file)}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  // Allow dropping on the blank area to move an item into the current folder.
  const handleBlankDrop = (e) => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData('application/json');
    onDropItem && onDropItem(currentPath, itemData);
  };

  return (
    <div
      style={paneContainer}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleBlankDrop}
    >
      <h3
        style={{
          borderBottom: '2px solid #4e54c8',
          paddingBottom: '5px',
          color: '#4e54c8',
        }}
      >
        {currentFolder.name}
      </h3>
      {viewModeControls}
      {content}
    </div>
  );
}

export default ContentPane;
