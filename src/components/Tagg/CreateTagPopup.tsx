import React, {
  useState,
  useCallback,
  ChangeEvent,
  MouseEvent,
  FC,
  CSSProperties,
} from "react";
import { TagData } from "../../types/TagData";
import { SelectionRange } from "../../types/Doc";

interface CreateTagPopupProps {
  onSave: (tagData: TagData) => void;
  onCancel: () => void;
  // For file connection tags:
  targetFile?: { id: string; name: string };
  // For highlight connection tags (the highlighted text is provided as an object):
  highlightedText?: { id: string; name: string; selection: SelectionRange };
}

// --------------------- Styling Objects ---------------------
const popupStyle: CSSProperties = {
  position: "fixed",
  top: "20%",
  left: "50%",
  transform: "translate(-50%, -20%)",
  background: "#fff",
  border: "1px solid #ddd",
  padding: "20px",
  zIndex: 2000,
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  width: "320px",
  borderRadius: "8px",
  fontFamily: "Arial, sans-serif",
};

const buttonStyle: CSSProperties = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background 0.2s ease",
};

const cancelButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "#ccc",
  color: "#333",
};

const saveButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "#00796b",
  color: "#fff",
};

// --------------------- CreateTagPopup Component ---------------------
const CreateTagPopup: FC<CreateTagPopupProps> = ({
  onSave,
  onCancel,
  targetFile,
  highlightedText,
}) => {
  // Common fields
  const [tagType, setTagType] = useState<string>("generic");
  const [tagColor, setTagColor] = useState<string>("#00796b");
  const [relatedTags, setRelatedTags] = useState<string>("");

  // Generic Tag states
  const [tagName, setTagName] = useState<string>("");
  const [tagDescription, setTagDescription] = useState<string>("");

  // Timestamp Tag state
  const [timestampOption, setTimestampOption] = useState<string>("now");

  // Geo Tag states
  const [advancedGeo, setAdvancedGeo] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  // Date Range Tag state
  const [dateRange, setDateRange] = useState<string>("");

  // Entity Linking Tag states
  const [entityId, setEntityId] = useState<string>("");
  const [entityDescription, setEntityDescription] = useState<string>("");

  // File Connection Tag states
  const [subjectFileId, setSubjectFileId] = useState<string>("");
  const [relationshipPredicate, setRelationshipPredicate] =
    useState<string>(""); // Added state

  // Highlight Connection Tag states
  const [highlightPredicate, setHighlightPredicate] = useState<string>("");
  const [highlightObject, setHighlightObject] = useState<string>("");

  // --------------------- Save Handler ---------------------
  const handleSave = useCallback(() => {
    const relatedArray = relatedTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    const tagData: TagData = {
      type: tagType as
        | "generic"
        | "timestamp"
        | "geo"
        | "dateRange"
        | "entityLink"
        | "fileConnection"
        | "highlightConnection",
      color: tagColor,
      related: relatedArray,
      name: "",
    };

    switch (tagType) {
      case "generic":
        tagData.name = tagName.trim();
        if (tagDescription.trim()) {
          tagData.description = tagDescription.trim();
        }
        break;
      case "timestamp": {
        const now = new Date();
        let generatedTimestamp = "";
        switch (timestampOption) {
          case "now":
            generatedTimestamp = now
              .toISOString()
              .replace(/[-:]/g, "")
              .split(".")[0];
            break;
          case "today":
            generatedTimestamp = now
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "");
            break;
          case "tomorrow": {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            generatedTimestamp = tomorrow
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "");
            break;
          }
          case "yesterday": {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            generatedTimestamp = yesterday
              .toISOString()
              .slice(0, 10)
              .replace(/-/g, "");
            break;
          }
          case "month":
            generatedTimestamp = `${now.getFullYear()}${(now.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            break;
          case "year":
            generatedTimestamp = `${now.getFullYear()}`;
            break;
          default:
            generatedTimestamp = "";
        }
        tagData.name = generatedTimestamp;
        break;
      }
      case "geo":
        if (tagDescription.trim()) {
          tagData.description = tagDescription.trim();
        }
        tagData.latitude = advancedGeo ? latitude.trim() : null;
        tagData.longitude = advancedGeo ? longitude.trim() : null;
        break;
      case "dateRange":
        tagData.name = dateRange.trim();
        break;
      case "entityLink":
        tagData.entityId = entityId.trim();
        if (entityDescription.trim()) {
          tagData.description = entityDescription.trim();
        }
        break;
      case "fileConnection":
        // For file connection tags, set the subject as an object using the user‑provided subjectFileId.
        tagData.subject = {
          id: subjectFileId.trim(),
          name: subjectFileId.trim(),
        };
        tagData.relationshipPredicate = relationshipPredicate.trim();
        tagData.name = `${subjectFileId.trim()} -- ${relationshipPredicate.trim()} --> ${
          targetFile?.name || ""
        }`;
        break;
      case "highlightConnection":
        if (!highlightedText) {
          console.error(
            "Highlighted text is required for highlight connection tags."
          );
          return;
        }
        tagData.name = `${
          highlightedText.name
        } -- ${highlightPredicate.trim()} --> ${highlightObject.trim()}`;
        // For highlight connections, store the highlighted text object as the subject.
        tagData.subject = highlightedText;
        tagData.relationshipPredicate = highlightPredicate.trim();
        break;
      default:
        break;
    }

    onSave(tagData);

    // Reset fields after saving.
    setTagType("generic");
    setTagName("");
    setTagDescription("");
    setTagColor("#00796b");
    setTimestampOption("now");
    setAdvancedGeo(false);
    setLatitude("");
    setLongitude("");
    setDateRange("");
    setEntityId("");
    setEntityDescription("");
    setRelatedTags("");
    setRelationshipPredicate("");
    setSubjectFileId("");
    setHighlightPredicate("");
    setHighlightObject("");
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
    relationshipPredicate,
    subjectFileId,
    highlightPredicate,
    highlightObject,
    highlightedText,
    targetFile,
    onSave,
  ]);

  // --------------------- Render JSX ---------------------
  return (
    <div style={popupStyle}>
      <h3>Create a Tag</h3>

      {/* Tag Type Selector */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Tag Type:
        </label>
        <select
          value={tagType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setTagType(e.target.value)
          }
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="generic">Generic Tag</option>
          <option value="timestamp">Custom Timestamp Tag</option>
          <option value="geo">Geo Tag</option>
          <option value="dateRange">Date Range Tag</option>
          <option value="entityLink">Entity Linking Tag</option>
          {targetFile && (
            <option value="fileConnection">File Connection Tag</option>
          )}
          {highlightedText && (
            <option value="highlightConnection">
              Highlight Connection Tag
            </option>
          )}
        </select>
      </div>

      {/* Render fields based on tag type */}
      {tagType === "generic" && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Name:
            </label>
            <input
              type="text"
              value={tagName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTagName(e.target.value)
              }
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Description:
            </label>
            <textarea
              value={tagDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setTagDescription(e.target.value)
              }
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </>
      )}

      {tagType === "timestamp" && (
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Timestamp Option:
          </label>
          <select
            value={timestampOption}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setTimestampOption(e.target.value)
            }
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
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

      {tagType === "geo" && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Location Description:
            </label>
            <input
              type="text"
              value={tagDescription}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTagDescription(e.target.value)
              }
              placeholder="Optional description"
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Geo Tagging Mode:
            </label>
            <button
              type="button"
              onClick={() => setAdvancedGeo(!advancedGeo)}
              style={{
                ...buttonStyle,
                background: advancedGeo ? "#00796b" : "#ccc",
                color: "#fff",
              }}
            >
              {advancedGeo ? "Advanced Mode On" : "Enable Advanced Mode"}
            </button>
          </div>
          {advancedGeo && (
            <>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Latitude:
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLatitude(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Longitude:
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLongitude(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            </>
          )}
        </>
      )}

      {tagType === "dateRange" && (
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            Date Range (e.g., 20160531-20160603):
          </label>
          <input
            type="text"
            value={dateRange}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDateRange(e.target.value)
            }
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}

      {tagType === "entityLink" && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Entity ID:
            </label>
            <input
              type="text"
              value={entityId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEntityId(e.target.value)
              }
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Entity Description:
            </label>
            <textarea
              value={entityDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setEntityDescription(e.target.value)
              }
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </>
      )}

      {tagType === "fileConnection" && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Subject (File):
            </label>
            <div
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#f9f9f9",
              }}
            >
              {targetFile?.name || "No highlighted text provided"}
            </div>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Predicate (Relationship Type):
            </label>
            <input
              type="text"
              value={relationshipPredicate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRelationshipPredicate(e.target.value)
              }
              placeholder="e.g., references, duplicates, related-to"
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Subject File ID:
            </label>
            <input
              type="text"
              value={subjectFileId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSubjectFileId(e.target.value)
              }
              placeholder="Enter subject file identifier"
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          {targetFile && (
            <div
              style={{
                marginBottom: "10px",
                fontStyle: "italic",
                color: "#555",
              }}
            >
              Target File: {targetFile.name}
            </div>
          )}
        </>
      )}

      {tagType === "highlightConnection" && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Subject (Highlighted Text):
            </label>
            <div
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#f9f9f9",
              }}
            >
              {highlightedText?.name || "No highlighted text provided"}
            </div>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Predicate (Relationship Type):
            </label>
            <input
              type="text"
              value={highlightPredicate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setHighlightPredicate(e.target.value)
              }
              placeholder="e.g., supports, contradicts, references"
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Object (Target Attachment):
            </label>
            <input
              type="text"
              value={highlightObject}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setHighlightObject(e.target.value)
              }
              placeholder="Enter target attachment or related info"
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </>
      )}

      {/* Common Fields */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Tag Color:
        </label>
        <input
          type="color"
          value={tagColor}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTagColor(e.target.value)
          }
          style={{
            width: "100%",
            height: "30px",
            border: "none",
            padding: 0,
            background: "none",
          }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Related Tags (comma separated):
        </label>
        <input
          type="text"
          value={relatedTags}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setRelatedTags(e.target.value)
          }
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: "right" }}>
        <button
          tabIndex={-1}
          onMouseDown={(e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={cancelButtonStyle}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          tabIndex={-1}
          onMouseDown={(e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{ ...saveButtonStyle, marginLeft: "8px" }}
          onClick={handleSave}
        >
          Save Tag
        </button>
      </div>
    </div>
  );
};

export default CreateTagPopup;
