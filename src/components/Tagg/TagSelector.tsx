import React from 'react';
import { handlePrevent } from '../../Helper';

interface Tag {
  name: string;
  color: string;
}

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: string[];
  onToggleTag: (tagName: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ availableTags, selectedTags, onToggleTag }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        return (
          <button
            key={tag.name}
            tabIndex={-1}
            onMouseDown={handlePrevent}
            onClick={(e) => {
              handlePrevent(e);
              console.log(`Toggling tag: ${tag.name}`);
              onToggleTag(tag.name);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: isSelected ? `2px solid ${tag.color}` : '1px solid #ccc',
              background: isSelected ? tag.color : '#fff',
              color: isSelected ? '#fff' : tag.color,
              cursor: 'pointer',
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
};

export default TagSelector;
