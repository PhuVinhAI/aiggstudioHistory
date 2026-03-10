export interface FileData {
  mimeType: string;
  base64: string;
  timestamp: number;
}

export type Vault = Record<string, FileData>;

export interface ExportConfig {
  includeImages: boolean;
  includePDFs: boolean;
}

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
  thoughts?: string;
  attachments?: string[];
}
