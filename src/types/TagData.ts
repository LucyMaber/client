import { SelectionRange } from "../types/Doc";

export interface TagData {
  type:
    | "generic"
    | "timestamp"
    | "geo"
    | "dateRange"
    | "entityLink"
    | "fileConnection"
    | "highlightConnection";
  color: string;
  related: string[];
  name: string;
  description?: string;
  latitude?: string | null;
  longitude?: string | null;
  entityId?: string;
  // Fields for File Connection Tags
  subject?: 
    | { id: string; name: string; selection: SelectionRange }
    | { id: string; name: string; };
  relationshipPredicate?: string;
}
