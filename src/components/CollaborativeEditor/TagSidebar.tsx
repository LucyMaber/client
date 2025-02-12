// src/components/CollaborativeEditor/TagSidebar.tsx
import React, { useMemo } from 'react';
import { TagData } from '../../types/TagData';


interface TagSidebarProps {
  projectTags: TagData[];
  tagCounts: Record<string, number>;
  selectedTag?: string | null;
  onSelectTag: (tagName: string) => void;
  onShowCreateTag: () => void;
}

const TagSidebar: React.FC<TagSidebarProps> = ({
  projectTags,
  tagCounts,
  selectedTag,
  onSelectTag,
  onShowCreateTag,
}) => {
  // Sort tags alphabetically
  const sortedTags = useMemo(() => {
    return [...projectTags].sort((a, b) => a.name.localeCompare(b.name));
  }, [projectTags]);

  return (
    <div
      style={{
        width: '250px',
        padding: '20px',
        background: '#fff',
        borderRight: '1px solid #ddd',
      }}
    >
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
        Tags
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sortedTags.map((tag) => (
          <li
            key={tag.name}
            style={{
              marginBottom: '12px',
              padding: '8px',
              background: selectedTag === tag.name ? '#e0f7fa' : '#fafafa',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => onSelectTag(tag.name)}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{tag.name}</span>
              <span
                style={{
                  background: '#ddd',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.8rem',
                }}
              >
                {tagCounts[tag.name] || 0}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={onShowCreateTag}
        style={{
          marginTop: '10px',
          padding: '8px 12px',
          borderRadius: '4px',
          border: 'none',
          background: '#00796b',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Create Tag
      </button>
    </div>
  );
};

export default TagSidebar;
