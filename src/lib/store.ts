import { create } from 'zustand';
import type { ChatTurn } from '@/types';

interface EditorState {
  chatTurns: ChatTurn[];
  selectedTurns: Set<number>;
  showThinking: boolean;
  includeImages: boolean;
  includePDFs: boolean;
  driveToken: string;
  
  // Actions
  setChatTurns: (turns: ChatTurn[]) => void;
  toggleTurnSelection: (index: number) => void;
  selectAllTurns: () => void;
  deselectAllTurns: () => void;
  setShowThinking: (show: boolean) => void;
  setIncludeImages: (include: boolean) => void;
  setIncludePDFs: (include: boolean) => void;
  setDriveToken: (token: string) => void;
  removeTurn: (index: number) => void;
  removeAttachment: (turnIndex: number, attachmentIndex: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  chatTurns: [],
  selectedTurns: new Set(),
  showThinking: true,
  includeImages: true,
  includePDFs: true,
  driveToken: '',
  
  setChatTurns: (turns) => set({ chatTurns: turns, selectedTurns: new Set(turns.map((_, i) => i)) }),
  
  toggleTurnSelection: (index) => set((state) => {
    const newSelected = new Set(state.selectedTurns);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    return { selectedTurns: newSelected };
  }),
  
  selectAllTurns: () => set((state) => ({
    selectedTurns: new Set(state.chatTurns.map((_, i) => i))
  })),
  
  deselectAllTurns: () => set({ selectedTurns: new Set() }),
  
  setShowThinking: (show) => set({ showThinking: show }),
  setIncludeImages: (include) => set({ includeImages: include }),
  setIncludePDFs: (include) => set({ includePDFs: include }),
  setDriveToken: (token) => set({ driveToken: token }),
  
  removeTurn: (index) => set((state) => {
    const newTurns = state.chatTurns.filter((_: ChatTurn, i: number) => i !== index);
    const newSelected = new Set(state.selectedTurns);
    newSelected.delete(index);
    // Adjust indices
    const adjustedSelected = new Set<number>();
    newSelected.forEach(i => {
      if (i > index) adjustedSelected.add(i - 1);
      else if (i < index) adjustedSelected.add(i);
    });
    return { chatTurns: newTurns, selectedTurns: adjustedSelected };
  }),
  
  removeAttachment: (turnIndex, attachmentIndex) => set((state) => {
    const newTurns = [...state.chatTurns];
    const turn = newTurns[turnIndex];
    if (turn.attachments) {
      turn.attachments = turn.attachments.filter((_: string, i: number) => i !== attachmentIndex);
      if (turn.attachments.length === 0) {
        turn.attachments = undefined;
      }
    }
    return { chatTurns: newTurns };
  }),
}));
