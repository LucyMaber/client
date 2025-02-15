import React, { useMemo } from 'react';
import { getHighlights } from '../../Helper';

// Define a type for individual highlight items.
export interface Highlight {
  blockKey: string;
  text: string;
  tags: string[];
  entityKey: string;
  
}

// Define props for the component.
// You can update `contentState`'s type if a more specific type is available.
interface HighlightsDisplayProps {
  contentState?: Highlight[];
  selectedTag?: string|null;
}

const HighlightsDisplay: React.FC<HighlightsDisplayProps> = ({ contentState, selectedTag }) => {
  // Calculate highlights based on the contentState.
  // Guard against undefined contentState by returning an empty array.
  const highlights: Highlight[] = useMemo(() => {
    if (!contentState) return [];
    return getHighlights(contentState);
  }, [contentState]);

  // Filter highlights if a selectedTag is provided.
  const filteredHighlights: Highlight[] = useMemo(() => {
    if (!selectedTag) return highlights;
    return highlights.filter((hl) =>
      hl.tags.some((tag) => tag === selectedTag || tag.startsWith(`${selectedTag}.`))
    );
  }, [highlights, selectedTag]);

  // Render a message if there are no highlights.
  if (filteredHighlights.length === 0) {
    return (
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#777' }}>
        {selectedTag ? 'No highlights for the selected tag.' : 'No highlights yet.'}
      </div>
    );
  }

  // Render the list of highlights.
  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
        Highlighted Segments
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredHighlights.map((hl, index) => (
          <li
            key={`${hl.blockKey}-${index}`}
            style={{
              marginBottom: '12px',
              padding: '8px',
              background: '#fafafa',
              borderRadius: '6px',
            }}
          >
            <strong>Text:</strong> "{hl.text}" <br />
            <strong>Tags:</strong> {hl.tags.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HighlightsDisplay;
