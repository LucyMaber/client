// src/pages/CollaborativeEditor/CollaborativeEditor.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  Modifier,
  CompositeDecorator,
  SelectionState,
  ContentBlock,
  CharacterMetadata,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import CreateTagPopup from '../../components/Tagg/CreateTagPopup';
import TagSelector from '../../components/Tagg/TagSelector';
import TagSidebar from '../../components/CollaborativeEditor/TagSidebar';
import {
  handlePrevent,
  cancelButtonStyle,
  deleteButtonStyle,
  saveButtonStyle,
  findHighlightEntities,
} from '../../Helper';
import HighlightComponent from "../../components/CollaborativeEditor/HighlightComponent";
import HighlightsDisplay from "../../components/CollaborativeEditor/HighlightsDisplay";
import { TagData } from '../../types/TagData';
import {
  CollaborativeEditorDraftProps,
  EditingHighlight,
  HighlightClickDetail,
  SelectionRange
} from '../../types/Doc';
import { DocumentContext, DocumentProvider } from '../../providers/DocumentProvider';

// ---------------------
// Styling Objects
// ---------------------
const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  fontFamily: 'Arial, sans-serif',
  background: '#f5f7fa',
};

const editorContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
};

const editorWrapperStyle: React.CSSProperties = {
  position: 'relative',
  border: '1px solid #ddd',
  padding: '20px',
  minHeight: '300px',
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};

const popupStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: '#fff',
  border: '1px solid #ddd',
  padding: '15px',
  zIndex: 1000,
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  width: '280px',
  transition: 'opacity 0.2s ease',
};

// ---------------------
// Create a Decorator Dynamically
// ---------------------
const createDecorator = (projectTags: TagData[]) =>
  new CompositeDecorator([
    {
      strategy: findHighlightEntities,
      component: (props: any) => (
        <HighlightComponent {...props} projectTags={projectTags} />
      ),
    },
  ]);

// ---------------------
// Helper Functions
// ---------------------

// Local version of getSelectedText
const getSelectedTextLocal = (editorState: EditorState): string => {
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
    const block: ContentBlock = blockMap.get(blockKeys[i])!;
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

// Local version of getSelectionForEntity
const getSelectionForEntityLocal = (
  entityKey: string,
  contentState: ContentState
): SelectionRange | null => {
  let selection: SelectionRange | null = null;
  contentState.getBlockMap().forEach((block) => {
    if (!block) return;
    block.findEntityRanges(
      (character: CharacterMetadata) => character.getEntity() === entityKey,
      (start: number, end: number) => {
        if (!selection) {
          selection = { blockKey: block.getKey(), start, end };
        }
      }
    );
  });
  console.log('Entity selection:', selection);
  return selection;
};

// Local interface for highlight details.
interface LocalHighlight {
  blockKey: string;
  text: string;
  tags: string[];
  entityKey: string;
}

// Local version of getHighlights
const getHighlightsLocal = (contentState: ContentState): LocalHighlight[] => {
  const highlights: LocalHighlight[] = [];
  contentState.getBlockMap().forEach((block) => {
    if (!block) return;
    block.findEntityRanges(
      (character: CharacterMetadata) => {
        const entityKey = character.getEntity();
        if (!entityKey) return false;
        return contentState.getEntity(entityKey).getType() === 'HIGHLIGHT';
      },
      (start: number, end: number) => {
        const entityKey = block.getEntityAt(start);
        if (entityKey) {
          const entity = contentState.getEntity(entityKey);
          const { tags } = entity.getData();
          const text = block.getText().slice(start, end);
          highlights.push({ blockKey: block.getKey(), text, tags, entityKey });
        }
      }
    );
  });
  return highlights;
};

// ---------------------
// Main Editor Component
// ---------------------
const CollaborativeEditorDraft: React.FC<CollaborativeEditorDraftProps> = ({
  doc_id
}) => {
  // Get document content and loading status from the provider.
  const { docContent,collaborativeSocket,isLoading } = useContext(DocumentContext);

  // Project tags remain as before.
  const [projectTags, setProjectTags] = useState<TagData[]>([
    {
      name: 'interesting',
      description: 'Default tag: interesting',
      color: '#FFC107',
      type: 'generic',
      related: [],
    },
    {
      name: 'important',
      description: 'Important info',
      color: '#D32F2F',
      type: 'generic',
      related: [],
    },
    {
      name: 'review',
      description: 'For review',
      color: '#1976D2',
      type: 'generic',
      related: [],
    },
  ]);

  // Initialize the editor state with the document content.
  const [editorState, setEditorState] = useState<EditorState>(() => {
    const contentState = ContentState.createFromText(docContent);
    return EditorState.createWithContent(contentState, createDecorator(projectTags));
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingHighlight, setEditingHighlight] = useState<EditingHighlight | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCreateTagPopup, setShowCreateTagPopup] = useState<boolean>(false);
  const [showTagPopup, setShowTagPopup] = useState<boolean>(false);

  const savedSelectionRef = useRef<SelectionState | null>(null);
  const editorRef = useRef<Editor | null>(null);

  // Update the decorator when projectTags change.
  useEffect(() => {
    setEditorState((prevState: EditorState) =>
      EditorState.set(prevState, { decorator: createDecorator(projectTags) })
    );
  }, [projectTags]);

  // Reinitialize the editorState when docContent changes.
  useEffect(() => {
    const contentState = ContentState.createFromText(docContent);
    setEditorState(EditorState.createWithContent(contentState, createDecorator(projectTags)));
  }, [docContent, projectTags]);

  const onChange = useCallback((state: EditorState) => {
    setEditorState(state);
    if (!state.getSelection().isCollapsed()) {
      savedSelectionRef.current = state.getSelection();
    }
  }, []);

  const handleEditorMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if ((e.target as HTMLElement).closest('.tag-popup')) return;
      requestAnimationFrame(() => {
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
          const selectedText = getSelectedTextLocal(editorState);
          if (selectedText.trim().length > 0) {
            console.log('Valid selection detected.');
            if (!savedSelectionRef.current) {
              savedSelectionRef.current = selection;
            }
            setEditingHighlight(null);
            setShowTagPopup(true);
            return;
          }
        }
        console.log('No valid selection.');
        if (!savedSelectionRef.current) {
          setShowTagPopup(false);
        }
      });
    },
    [editorState]
  );

  useEffect(() => {
    const handleHighlightClick = (e: Event) => {
      const customEvent = e as CustomEvent<HighlightClickDetail>;
      const { entityKey } = customEvent.detail;
      console.log('Highlight click event for entityKey:', entityKey);
      const contentState = editorState.getCurrentContent();
      const selectionRange = getSelectionForEntityLocal(entityKey, contentState);
      if (selectionRange) {
        const entity = contentState.getEntity(entityKey);
        const { tags } = entity.getData();
        console.log('Editing highlight with tags:', tags);
        setEditingHighlight({ entityKey, selectionRange, tags });
        setSelectedTags(tags);
        setShowTagPopup(true);
      }
    };
    window.addEventListener('highlightClick', handleHighlightClick);
    return () => window.removeEventListener('highlightClick', handleHighlightClick);
  }, [editorState]);

  const onToggleTag = useCallback((tagName: string) => {
    setSelectedTags((prevSelected: string[]) => {
      const newTags = prevSelected.includes(tagName)
        ? prevSelected.filter((t) => t !== tagName)
        : [...prevSelected, tagName];
      console.log('Updated selected tags:', newTags);
      return newTags;
    });
  }, []);

  const applyHighlight = useCallback(() => {
    if (selectedTags.length === 0) return;
    const newTags = selectedTags;
    const contentState = editorState.getCurrentContent();
    let newContentState: ContentState;
    if (editingHighlight) {
      // Merge new tags with the existing ones without overriding any tag.
      const existingTags = editingHighlight.tags || [];
      const mergedTags = Array.from(new Set([...existingTags, ...newTags]));
      console.log('Merged tags:', mergedTags);
      newContentState = contentState.replaceEntityData(editingHighlight.entityKey, { tags: mergedTags });
    } else if (savedSelectionRef.current && !savedSelectionRef.current.isCollapsed()) {
      console.log('Creating new highlight with tags:', newTags);
      const contentStateWithEntity = contentState.createEntity('HIGHLIGHT', 'MUTABLE', { tags: newTags });
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      newContentState = Modifier.applyEntity(contentStateWithEntity, savedSelectionRef.current, entityKey);
    } else {
      console.log('No valid selection for applying highlight.');
      return;
    }
    // Merge any overlapping highlights so that tags are combined (nested highlighting)
    newContentState = mergeOverlappingHighlights(newContentState);
    let newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
    newEditorState = EditorState.forceSelection(newEditorState, newEditorState.getSelection());
    newEditorState = EditorState.set(newEditorState, { decorator: createDecorator(projectTags) });
    setEditorState(newEditorState);
    console.log('Highlight applied successfully.');
    savedSelectionRef.current = null;
    setEditingHighlight(null);
    setShowTagPopup(false);
    setSelectedTags([]);
  }, [selectedTags, editorState, editingHighlight, projectTags]);

  /**
   * Merges overlapping highlights by:
   * 1. Iterating over each block and gathering all highlight intervals (their start, end, and tags).
   * 2. Determining the unique boundary offsets.
   * 3. For each sub-range (between adjacent boundaries), calculating the union of tags
   *    from all intervals that cover that range.
   * 4. Clearing any existing highlight entities in the block and reapplying a new entity
   *    with the merged (nested) tags on each segment.
   */
  const mergeOverlappingHighlights = useCallback((contentState: ContentState): ContentState => {
    let newContentState = contentState;
    const blockMap = newContentState.getBlockMap();
    blockMap.forEach((block) => {
      if (!block) return;
      const blockKey = block.getKey();
      const textLength = block.getLength();
      let intervals: { start: number; end: number; tags: string[] }[] = [];
      
      // Collect all highlight intervals in this block.
      block.findEntityRanges(
        (character: CharacterMetadata) => {
          const entityKey = character.getEntity();
          if (!entityKey) return false;
          const entity = newContentState.getEntity(entityKey);
          return entity.getType() === 'HIGHLIGHT';
        },
        (start: number, end: number) => {
          const entityKey = block.getEntityAt(start);
          if (entityKey) {
            const entity = newContentState.getEntity(entityKey);
            const { tags } = entity.getData();
            intervals.push({ start, end, tags });
          }
        }
      );
      if (intervals.length === 0) return;
      
      // Create a set of boundaries where any highlight starts or ends.
      let boundaries = new Set<number>([0, textLength]);
      intervals.forEach((interval) => {
        boundaries.add(interval.start);
        boundaries.add(interval.end);
      });
      const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);
      
      // Clear out any existing highlight entities for the entire block.
      let entireSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: textLength,
      }) as SelectionState;
      newContentState = Modifier.applyEntity(newContentState, entireSelection, null);
      
      // For each segment between boundaries, compute the union of tags from overlapping highlights.
      for (let i = 0; i < sortedBoundaries.length - 1; i++) {
        const start = sortedBoundaries[i];
        const end = sortedBoundaries[i + 1];
        let unionTags: string[] = [];
        intervals.forEach((interval) => {
          if (interval.start <= start && interval.end >= end) {
            unionTags = Array.from(new Set([...unionTags, ...interval.tags]));
          }
        });
        // Reapply a highlight entity with the merged (nested) tags if any tags are present.
        if (unionTags.length > 0) {
          const selection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: start,
            focusOffset: end,
          }) as SelectionState;
          newContentState = newContentState.createEntity('HIGHLIGHT', 'MUTABLE', { tags: unionTags });
          const newEntityKey = newContentState.getLastCreatedEntityKey();
          newContentState = Modifier.applyEntity(newContentState, selection, newEntityKey);
        }
      }
    });
    return newContentState;
  }, []);

  const deleteHighlight = useCallback(() => {
    if (editingHighlight) {
      const contentState = editorState.getCurrentContent();
      const { blockKey, start, end } = editingHighlight.selectionRange;
      const selection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: start,
        focusOffset: end,
      }) as SelectionState;
      const newContentState = Modifier.applyEntity(contentState, selection, null);
      let newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');
      newEditorState = EditorState.forceSelection(newEditorState, newEditorState.getSelection());
      newEditorState = EditorState.set(newEditorState, { decorator: createDecorator(projectTags) });
      setEditorState(newEditorState);
      console.log('Highlight deleted.');
      setEditingHighlight(null);
      setShowTagPopup(false);
      setSelectedTags([]);
    }
  }, [editorState, editingHighlight, projectTags]);

  const handleCreateTag = useCallback((tagData: TagData) => {
    const { name, description, color } = tagData;
    const exists = projectTags.some((tag) => tag.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      const newTags: TagData[] = [
        ...projectTags,
        { name, description, color, type: 'generic', related: [] },
      ];
      newTags.sort((a, b) => a.name.localeCompare(b.name));
      setProjectTags(newTags);
      console.log('Tag created:', { name, description, color });
    }
    setShowCreateTagPopup(false);
  }, [projectTags]);

  const tagCounts = useMemo(
    () => computeTagCounts(editorState.getCurrentContent()),
    [editorState]
  );

  function computeTagCounts(contentState: ContentState): Record<string, number> {
    const highlights = getHighlightsLocal(contentState);
    const counts: Record<string, number> = {};
    highlights.forEach((hl) => {
      hl.tags.forEach((tag: string) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }

  // Optionally, show a loading indicator until the document is fetched.
  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading document...</div>;
  }

  return (
    <div style={containerStyle}>
      <TagSidebar
        projectTags={projectTags}
        tagCounts={tagCounts}
        selectedTag={selectedTag}
        onSelectTag={(tagName: string) =>
          setSelectedTag((prev) => (prev === tagName ? null : tagName))
        }
        onShowCreateTag={() => setShowCreateTagPopup(true)}
      />
      <div style={editorContainerStyle}>
        <div style={editorWrapperStyle} onMouseUp={handleEditorMouseUp}>
          <Editor
            editorState={editorState}
            onChange={onChange}
            placeholder="Select text to highlight and tag..."
            ref={editorRef}
          />
          {showTagPopup && (
            <div className="tag-popup" style={popupStyle} onMouseDown={handlePrevent}>
              <h4 style={{ margin: '0 0 10px' }}>
                {editingHighlight ? 'Edit Highlight' : 'New Highlight'}
              </h4>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
                  Select tags:
                </label>
                <TagSelector
                  selectedTags={selectedTags}
                  onToggleTag={onToggleTag}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  tabIndex={-1}
                  onMouseDown={handlePrevent}
                  onClick={() => {
                    savedSelectionRef.current = null;
                    setEditingHighlight(null);
                    setSelectedTags([]);
                    setShowTagPopup(false);
                  }}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                {editingHighlight && (
                  <button
                    tabIndex={-1}
                    onMouseDown={handlePrevent}
                    onClick={deleteHighlight}
                    style={{ ...deleteButtonStyle, marginLeft: '8px' }}
                  >
                    Delete Highlight
                  </button>
                )}
                <button
                  tabIndex={-1}
                  onMouseDown={handlePrevent}
                  onClick={applyHighlight}
                  style={{ ...saveButtonStyle, marginLeft: '8px' }}
                  disabled={selectedTags.length === 0}
                >
                  Save &amp; Close
                </button>
              </div>
            </div>
          )}
        </div>
        <HighlightsDisplay
          contentState={editorState.getCurrentContent()}
          selectedTag={selectedTag}
        />
      </div>
      {showCreateTagPopup && (
        <CreateTagPopup onSave={handleCreateTag} onCancel={() => setShowCreateTagPopup(false)} />
      )}
    </div>
  );
};



const App = () => {
  const doc_id = "your-document-id"; // Replace with your actual document ID

  return (
    <DocumentProvider doc_id={doc_id}>
      <CollaborativeEditorDraft doc_id={doc_id} />
    </DocumentProvider>
  );
};

export default App;
