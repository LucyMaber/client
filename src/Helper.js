// ---------------------
// Helper Functions: getHighlights & getTagCounts
// ---------------------
const getHighlights = (contentState) => {
    const highlights = [];
    contentState.getBlockMap().forEach((block) => {
      block.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (!entityKey) return false;
          return contentState.getEntity(entityKey).getType() === 'HIGHLIGHT';
        },
        (start, end) => {
          const entityKey = block.getEntityAt(start);
          const entity = contentState.getEntity(entityKey);
          const { tags } = entity.getData();
          const text = block.getText().slice(start, end);
          highlights.push({ blockKey: block.getKey(), text, tags, entityKey });
        }
      );
    });
    return highlights;
  };
  
  const getTagCounts = (contentState) => {
    const highlights = getHighlights(contentState);
    const tagCounts = {};
    highlights.forEach((hl) => {
      hl.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return tagCounts;
  };

  // ---------------------
// Utility: Prevent default & stop propagation
// ---------------------
const handlePrevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // ---------------------
  // Helper: Get Selected Text (across multiple blocks)
  // ---------------------
  // This version uses the ordered block keys to retrieve all text between the start and end of the selection.
  const getSelectedText = (editorState) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const startIndex = blockKeys.indexOf(startKey);
    const endIndex = blockKeys.indexOf(endKey);
    let selectedText = '';
  
    for (let i = startIndex; i <= endIndex; i++) {
      const block = blockMap.get(blockKeys[i]);
      const text = block.getText();
      if (i === startIndex && i === endIndex) {
        selectedText += text.slice(selection.getStartOffset(), selection.getEndOffset());
      } else if (i === startIndex) {
        selectedText += text.slice(selection.getStartOffset()) + '\n';
      } else if (i === endIndex) {
        selectedText += text.slice(0, selection.getEndOffset());
      } else {
        selectedText += text + '\n';
      }
    }
    console.log('Selected text:', selectedText);
    return selectedText;
  };
  
  // ---------------------
  // Helper Functions
  // ---------------------
  const getSelectionForEntity = (entityKey, contentState) => {
    let selection = null;
    contentState.getBlockMap().forEach((block) => {
      block.findEntityRanges(
        (character) => character.getEntity() === entityKey,
        (start, end) => {
          if (!selection) {
            selection = { blockKey: block.getKey(), start, end };
          }
        }
      );
    });
    console.log('Entity selection:', selection);
    return selection;
  };
  
  const findHighlightEntities = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        if (!entityKey) return false;
        return contentState.getEntity(entityKey).getType() === 'HIGHLIGHT';
      },
      callback
    );
  };
  const buttonStyle = {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  };
  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#ccc',
    color: '#333',
  };
  
  const saveButtonStyle = {
    ...buttonStyle,
    background: '#00796b',
    color: '#fff',
  };
  
  const deleteButtonStyle = {
    ...buttonStyle,
    background: '#d32f2f',
    color: '#fff',
  };
  
  const sidebarListItemStyle = (selected) => ({
    marginBottom: '12px',
    cursor: 'pointer',
    background: selected ? '#e0f7fa' : 'transparent',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background 0.2s ease',
  });

    const computeTagCounts = (contentState) => {
      const highlights = getHighlights(contentState);
      const tagCounts = {};
      highlights.forEach((hl) => {
        hl.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      return tagCounts;
    };
  
export { getHighlights, getTagCounts, handlePrevent, getSelectedText, getSelectionForEntity, findHighlightEntities,sidebarListItemStyle,computeTagCounts,
  buttonStyle, cancelButtonStyle, saveButtonStyle, deleteButtonStyle
 };