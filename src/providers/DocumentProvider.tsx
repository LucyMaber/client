// src/providers/DocumentProvider.tsx
import React, {
    createContext,
    useState,
    useEffect,
    useMemo,
    ReactNode,
  } from 'react';
  
  export interface DocumentContextType {
    docContent: string;
    isLoading: boolean;
    error: Error | null;
    collaborativeSocket: WebSocket | null; // Update with a proper type if available.
  }
  
  export const DocumentContext = createContext<DocumentContextType>({
    docContent: '',
    isLoading: false,
    error: null,
    collaborativeSocket: null,
  });
  
  const dummyText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
  
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
  
  Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. 
  Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. 
  Integer in mauris eu nibh euismod gravida.`;
  
  interface DocumentProviderProps {
    doc_id: string;
    children: ReactNode;
  }
  
  export const DocumentProvider: React.FC<DocumentProviderProps> = ({
    doc_id,
    children,
  }) => {
    const [docContent, setDocContent] = useState<string>(dummyText);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
  
    useEffect(() => {
      // Create an AbortController to cancel the fetch on unmount.
      const abortController = new AbortController();
  
      const fetchDoc = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/doc/${doc_id}`, {
            signal: abortController.signal,
          });
  
          if (!response.ok) {
            throw new Error(
              `Network response was not ok: ${response.status} ${response.statusText}`
            );
          }
  
          const data = await response.json();
          const content = data.content || dummyText;
          setDocContent(content);
        } catch (err: any) {
          // Ignore abort errors as they are expected on cleanup.
          if (err.name !== 'AbortError') {
            console.error('Failed to fetch document:', err);
            setError(err);
          }
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchDoc();
  
      // Cleanup: abort the fetch if the component unmounts.
      return () => {
        abortController.abort();
      };
    }, [doc_id]);
  
    // Memoize the context value to avoid unnecessary re-renders.
    const contextValue = useMemo(
      () => ({
        docContent,
        isLoading,
        error,
        collaborativeSocket: null, // Replace with actual socket initialization when ready.
      }),
      [docContent, isLoading, error]
    );
  
    return (
      <DocumentContext.Provider value={contextValue}>
        {children}
      </DocumentContext.Provider>
    );
  };
  