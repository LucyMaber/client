import React, {
    createContext,
    useReducer,
    useEffect,
    useContext,
    ReactNode,
  } from "react";
  import { TagData } from "../types/TagData";
  
  // -------------------- State & Actions --------------------
  
  interface TagState {
    tags: TagData[];
    loading: boolean;
    error: string | null;
  }
  
  type TagAction =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: TagData[] }
    | { type: "FETCH_FAILURE"; payload: string }
    | { type: "ADD_TAG"; payload: TagData }
    | { type: "UPDATE_TAG"; payload: TagData }
    | { type: "DELETE_TAG"; payload: string };
  
  function tagReducer(state: TagState, action: TagAction): TagState {
    switch (action.type) {
      case "FETCH_START":
        return { ...state, loading: true, error: null };
      case "FETCH_SUCCESS":
        return { ...state, loading: false, tags: action.payload };
      case "FETCH_FAILURE":
        return { ...state, loading: false, error: action.payload };
      case "ADD_TAG":
        return { ...state, tags: [...state.tags, action.payload] };
      case "UPDATE_TAG":
        return {
          ...state,
          tags: state.tags.map((tag) =>
            tag.name === action.payload.name ? action.payload : tag
          ),
        };
      case "DELETE_TAG":
        return { ...state, tags: state.tags.filter((tag) => tag.name !== action.payload) };
      default:
        return state;
    }
  }
  
  // -------------------- Context Setup --------------------
  
  interface TagContextType {
    state: TagState;
    fetchTags: () => Promise<void>;
    createTag: (tag: TagData) => Promise<void>;
    updateTag: (tag: TagData) => Promise<void>;
    deleteTag: (tagId: string) => Promise<void>;
  }
  
  const TagContext = createContext<TagContextType | undefined>(undefined);
  
  // -------------------- Provider Component --------------------
  
  export const TagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(tagReducer, {
      tags: [],
      loading: false,
      error: null,
    });
  
    // GET: Fetch all tags from the server.
    const fetchTags = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const data: TagData[] = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error: any) {
        dispatch({ type: "FETCH_FAILURE", payload: error.message });
      }
    };
  
    // POST: Create a new tag.
    const createTag = async (tag: TagData) => {
      try {
        const response = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tag),
        });
        if (!response.ok) {
          throw new Error("Failed to create tag");
        }
        const newTag: TagData = await response.json();
        dispatch({ type: "ADD_TAG", payload: newTag });
      } catch (error) {
        console.error("Error creating tag:", error);
      }
    };
  
    // PUT: Update an existing tag.
    const updateTag = async (tag: TagData) => {
      try {
        // Using tag.name as the unique identifier; change to tag.id if available.
        const response = await fetch(`/api/tags/${encodeURIComponent(tag.name)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tag),
        });
        if (!response.ok) {
          throw new Error("Failed to update tag");
        }
        const updatedTag: TagData = await response.json();
        dispatch({ type: "UPDATE_TAG", payload: updatedTag });
      } catch (error) {
        console.error("Error updating tag:", error);
      }
    };
  
    // DELETE: Remove a tag.
    const deleteTag = async (tagId: string) => {
      try {
        const response = await fetch(`/api/tags/${encodeURIComponent(tagId)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete tag");
        }
        dispatch({ type: "DELETE_TAG", payload: tagId });
      } catch (error) {
        console.error("Error deleting tag:", error);
      }
    };
  
    // Fetch tags on mount.
    useEffect(() => {
      fetchTags();
    }, []);
  
    return (
      <TagContext.Provider value={{ state, fetchTags, createTag, updateTag, deleteTag }}>
        {children}
      </TagContext.Provider>
    );
  };
  
  export const useTagContext = () => {
    const context = useContext(TagContext);
    if (context === undefined) {
      throw new Error("useTagContext must be used within a TagProvider");
    }
    return context;
  };
  