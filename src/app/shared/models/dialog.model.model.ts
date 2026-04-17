// src/app/shared/models/dialog.model.ts
export interface iDialogData {
  name?: string;
  username?: string;
  [key: string]: any; // optional: allows extra properties
}