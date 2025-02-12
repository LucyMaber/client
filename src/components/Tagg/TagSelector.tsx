import React from 'react';
import { handlePrevent } from '../../Helper';
import { TagData } from '../../types/TagData';
import { useTagContext } from '../../providers/TagProvider';

interface TagSelectorProps {
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onToggleTag }) => {
  // Get available tags from TagProvider
  const { state } = useTagContext();
  const availableTags: TagData[] = state.tags;

  // Handler for keyboard events to support toggling via Enter or Space.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tagName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleTag(tagName);
    }
  };

  if (!availableTags || availableTags.length === 0) {
    return <div>No tags available.</div>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        const buttonStyle: React.CSSProperties = {
          padding: '4px 8px',
          borderRadius: '4px',
          border: isSelected ? `2px solid ${tag.color}` : '1px solid #ccc',
          background: isSelected ? tag.color : '#fff',
          color: isSelected ? '#fff' : tag.color,
          cursor: 'pointer',
          outline: 'none',
        };

        return (
          <button
            key={tag.name}
            type="button"
            onMouseDown={(e) => handlePrevent(e)}
            onClick={(e) => {
              handlePrevent(e);
              console.log(`Toggling tag: ${tag.name}`);
              onToggleTag(tag.name);
            }}
            onKeyDown={(e) => handleKeyDown(e, tag.name)}
            style={buttonStyle}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
};


export default TagSelector;
