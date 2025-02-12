// ---------------------
// Interfaces and Types
// ---------------------
export interface Highlight {
  blockKey: string;
  text: string;
  tags: string[];
  entityKey: string;
}

export interface SelectionRange {
  blockKey: string;
  start: number;
  end: number;
}

export interface EditingHighlight {
  entityKey: string;
  selectionRange: SelectionRange;
  tags: string[];
}

/**
 * Interface for the document to be passed in.
 * - id: a unique document identifier.
 * - content: the text content for the editor.
 * - highlights: (optional) previously saved highlights.
 * - editingHighlights: (optional) any highlights currently being edited.
 */
export interface Doc {
  id: string;
  content: string;
  highlights?: Highlight[];
  editingHighlights?: EditingHighlight[];
}

/**
 * The component now expects a doc (of type Doc) rather than just an initialContent.
 * The collaborativeSocket remains optional.
 */
export interface CollaborativeEditorDraftProps {
  doc_id: String;
  collaborativeSocket?: any; // Update with a proper type if available.
}

export interface HighlightClickDetail {
  entityKey: string;
}
