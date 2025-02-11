import React, { useState, useCallback } from 'react';
import { cancelButtonStyle, handlePrevent, saveButtonStyle } from '../../Helper';

// Define a type for the tag object that will be created.
interface Tag {
  name: string;
  description: string;
  color: string;
}

// Define props for the component.
interface CreateTagPopupProps {
  onSave: (tag: Tag) => void;
  onCancel: () => void;
}

// Define a style object type for inline styles.
const createTagPopupStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, -20%)',
  background: '#fff',
  border: '1px solid #ddd',
  padding: '20px',
  zIndex: 2000,
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  width: '320px',
  borderRadius: '8px',
  fontFamily: 'Arial, sans-serif',
};

const CreateTagPopup: React.FC<CreateTagPopupProps> = ({ onSave, onCancel }) => {
  const [tagName, setTagName] = useState<string>('');
  const [tagDescription, setTagDescription] = useState<string>('');
  const [tagColor, setTagColor] = useState<string>('#00796b'); // default color

  const handleSave = useCallback((): void => {
    if (tagName.trim()) {
      console.log(`Creating tag: ${tagName.trim()}`);
      onSave({
        name: tagName.trim(),
        description: tagDescription.trim(),
        color: tagColor,
      });
      setTagName('');
      setTagDescription('');
      setTagColor('#00796b');
    }
  }, [tagName, tagDescription, tagColor, onSave]);

  return (
    <div style={createTagPopupStyle}>
      <h3>Create a Tag</h3>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Name:</label>
        <input
          type="text"
          value={tagName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagName(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Description:</label>
        <textarea
          value={tagDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setTagDescription(e.target.value)
          }
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Color:</label>
        <input
          type="color"
          value={tagColor}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagColor(e.target.value)}
          style={{
            width: '100%',
            height: '30px',
            border: 'none',
            padding: 0,
            background: 'none',
          }}
        />
      </div>
      <div style={{ textAlign: 'right' }}>
        <button
          tabIndex={-1}
          onMouseDown={handlePrevent}
          style={cancelButtonStyle}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          tabIndex={-1}
          onMouseDown={handlePrevent}
          style={{ ...saveButtonStyle, marginLeft: '8px' }}
          onClick={handleSave}
          disabled={!tagName.trim()}
        >
          Save Tag
        </button>
      </div>
    </div>
  );
};

export default CreateTagPopup;
