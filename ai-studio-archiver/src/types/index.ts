export interface FileData {
  mimeType: string;
  base64: string;
  timestamp: number;
}

export type Vault = Record<string, FileData>;

export interface ExportConfig {
  includeImages: boolean;
  includePDFs: boolean;
  apiToken?: string;
}

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
  thoughts?: string;
  attachments?: string[];
}

export interface PromptChunk {
  text: string;
  role: string;
  tokenCount?: number;
  isThought?: boolean;
  finishReason?: string;
  parts?: Array<{
    text: string;
    thought?: boolean;
  }>;
}

export interface PromptData {
  runSettings: any;
  systemInstruction: any;
  chunkedPrompt: {
    chunks: PromptChunk[];
    pendingInputs?: any[];
  };
}
