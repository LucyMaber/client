import React, { useState } from 'react';

// Define the structure of the data returned by the entity.
interface EntityData {
  tags: string[];
}

// Define the structure of an entity.
interface Entity {
  getData(): EntityData;
}

// Define the structure of the content state expected by the component.
interface ContentState {
  getEntity(entityKey: string): Entity;
}

// Define the structure of a project tag.
interface ProjectTag {
  name: string;
  color: string;
}

// Define the props for the HighlightComponent.
interface HighlightComponentProps {
  contentState: ContentState;
  entityKey: string;
  projectTags?: ProjectTag[];
  children?: React.ReactNode;
}

const HighlightComponent: React.FC<HighlightComponentProps> = ({
  contentState,
  entityKey,
  projectTags,
  children,
}) => {
  // Retrieve the entity using the provided contentState and entityKey.
  const entity = contentState.getEntity(entityKey);
  const { tags } = entity.getData();

  // Create tooltip content as an HTML element.
  const tooltipContent = (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '0',
        backgroundColor: '#333',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        zIndex: 9999,
        marginBottom: '4px',
      }}
    >
      {tags.join(', ')}
    </div>
  );

  // Use the first tag's color for background.
  const tagColor =
    tags && tags.length > 0 && projectTags
      ? (projectTags.find((t) => t.name === tags[0]) || {}).color
      : '#ffeb3b';

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      style={{
        position: 'relative',
        backgroundColor: tagColor,
        border: tags.length > 1 ? '2px dashed #000' : 'none',
        cursor: 'pointer',
        padding: '0 2px',
        borderRadius: '3px',
        color: '#333',
        fontWeight: tags && tags.length > 0 ? 'bold' : 'normal',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        console.log('Highlight clicked, entityKey:', entityKey);
        window.dispatchEvent(
          new CustomEvent('highlightClick', { detail: { entityKey } })
        );
      }}
    >
      {children}
      {showTooltip && tooltipContent}
    </span>
  );
};

export default HighlightComponent;
