import React, {
  useState,
  useCallback,
  ChangeEvent,
  MouseEvent,
  FC,
  CSSProperties,
} from 'react';

interface CreateTagPopupProps {
  onSave: (tagData: TagData) => void;
  onCancel: () => void;
}

// ---------------------
// Styling Objects
// ---------------------
const createTagPopupStyle: CSSProperties = {
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

const buttonStyle: CSSProperties = {
  padding: '6px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
};

const cancelButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: '#ccc',
  color: '#333',
};

const saveButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: '#00796b',
  color: '#fff',
};

// ---------------------
// Utility: Prevent default & stop propagation
// ---------------------
const handlePrevent = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

// ---------------------
// CreateTagPopup Component
// ---------------------
const CreateTagPopup: FC<CreateTagPopupProps> = ({ onSave, onCancel }) => {
  // Common fields
  const [tagType, setTagType] = useState<string>('generic');
  const [tagColor, setTagColor] = useState<string>('#00796b');
  const [relatedTags, setRelatedTags] = useState<string>('');

  // Fields for generic tags
  const [tagName, setTagName] = useState<string>('');
  const [tagDescription, setTagDescription] = useState<string>('');

  // Fields for custom timestamp tags
  const [timestampOption, setTimestampOption] = useState<string>('now');

  // Fields for geo tagging
  const [advancedGeo, setAdvancedGeo] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');

  // Field for date range tags
  const [dateRange, setDateRange] = useState<string>('');

  // Fields for entity linking tags
  const [entityId, setEntityId] = useState<string>('');
  const [entityDescription, setEntityDescription] = useState<string>('');

  // ---------------------
  // handleSave: Build the tag data and call onSave
  // ---------------------
  const handleSave = useCallback(() => {
    const tagData: TagData = {
      type: tagType,
      color: tagColor,
      // Convert comma-separated string to an array of trimmed tags
      related: relatedTags.split(',').map((t) => t.trim()).filter((t) => t !== ''),
      name: '',
    };

    if (tagType === 'generic') {
      tagData.name = tagName.trim();
      const desc = tagDescription.trim();
      if (desc) {
        tagData.description = desc;
      }
    } else if (tagType === 'timestamp') {
      const now = new Date();
      let generatedTimestamp = '';
      switch (timestampOption) {
        case 'now':
          generatedTimestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];
          break;
        case 'today':
          generatedTimestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
          break;
        case 'tomorrow': {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          generatedTimestamp = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');
          break;
        }
        case 'yesterday': {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          generatedTimestamp = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
          break;
        }
        case 'month':
          generatedTimestamp = `${now.getFullYear()}${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;
          break;
        case 'year':
          generatedTimestamp = `${now.getFullYear()}`;
          break;
        default:
          generatedTimestamp = '';
      }
      tagData.name = generatedTimestamp;
    } else if (tagType === 'geo') {
      const desc = tagDescription.trim();
      if (desc) {
        tagData.description = desc;
      }
      if (advancedGeo) {
        tagData.latitude = latitude.trim();
        tagData.longitude = longitude.trim();
      } else {
        tagData.latitude = null;
        tagData.longitude = null;
      }
    } else if (tagType === 'dateRange') {
      tagData.name = dateRange.trim();
    } else if (tagType === 'entityLink') {
      tagData.entityId = entityId.trim();
      const desc = entityDescription.trim();
      if (desc) {
        tagData.description = desc;
      }
    }

    onSave(tagData);

    // Reset fields after saving
    setTagType('generic');
    setTagName('');
    setTagDescription('');
    setTagColor('#00796b');
    setTimestampOption('now');
    setAdvancedGeo(false);
    setLatitude('');
    setLongitude('');
    setDateRange('');
    setEntityId('');
    setEntityDescription('');
    setRelatedTags('');
  }, [
    tagType,
    tagName,
    tagDescription,
    tagColor,
    timestampOption,
    advancedGeo,
    latitude,
    longitude,
    dateRange,
    entityId,
    entityDescription,
    relatedTags,
    onSave,
  ]);

  return (
    <div style={createTagPopupStyle}>
      <h3>Create a Tag</h3>

      {/* Select Tag Type */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Tag Type:</label>
        <select
          value={tagType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setTagType(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          <option value="generic">Generic Tag</option>
          <option value="timestamp">Custom Timestamp Tag</option>
          <option value="geo">Geo Tag</option>
          <option value="dateRange">Date Range Tag</option>
          <option value="entityLink">Entity Linking Tag</option>
        </select>
      </div>

      {/* Generic Tag Fields */}
      {tagType === 'generic' && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Name:</label>
            <input
              type="text"
              value={tagName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTagName(e.target.value)}
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
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTagDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>
        </>
      )}

      {/* Custom Timestamp Tag Fields */}
      {tagType === 'timestamp' && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Timestamp Option:</label>
          <select
            value={timestampOption}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setTimestampOption(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="now">Now</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="yesterday">Yesterday</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      )}

      {/* Geo Tag Fields */}
      {tagType === 'geo' && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Location Description:</label>
            <input
              type="text"
              value={tagDescription}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTagDescription(e.target.value)}
              placeholder="Optional description"
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Geo Tagging Mode:</label>
            <button
              type="button"
              onClick={() => setAdvancedGeo(!advancedGeo)}
              style={{
                ...buttonStyle,
                background: advancedGeo ? '#00796b' : '#ccc',
                color: '#fff',
              }}
            >
              {advancedGeo ? 'Advanced Mode On' : 'Enable Advanced Mode'}
            </button>
          </div>
          {advancedGeo && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Latitude:</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLatitude(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Longitude:</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLongitude(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Date Range Tag Field */}
      {tagType === 'dateRange' && (
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Date Range (e.g., 20160531-20160603):
          </label>
          <input
            type="text"
            value={dateRange}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDateRange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>
      )}

      {/* Entity Linking Tag Fields */}
      {tagType === 'entityLink' && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Entity ID:</label>
            <input
              type="text"
              value={entityId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEntityId(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Entity Description:</label>
            <textarea
              value={entityDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEntityDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>
        </>
      )}

      {/* Common Fields for All Tag Types */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Tag Color:</label>
        <input
          type="color"
          value={tagColor}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTagColor(e.target.value)}
          style={{
            width: '100%',
            height: '30px',
            border: 'none',
            padding: 0,
            background: 'none',
          }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Related Tags (comma separated):</label>
        <input
          type="text"
          value={relatedTags}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRelatedTags(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      {/* Action Buttons */}
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
          disabled={
            (tagType === 'generic' && !tagName.trim()) ||
            (tagType === 'timestamp' && !timestampOption) ||
            (tagType === 'geo' && advancedGeo && (!latitude.trim() || !longitude.trim())) ||
            (tagType === 'dateRange' && !dateRange.trim()) ||
            (tagType === 'entityLink' && !entityId.trim())
          }
        >
          Save Tag
        </button>
      </div>
    </div>
  );
};

export default CreateTagPopup;

// Updated TagData interface with optional description and other optional fields
export interface TagData {
  type: string;
  color: string;
  related: string[];
  name: string;
  description?: string;
  latitude?: string | null;
  longitude?: string | null;
  entityId?: string;
}
