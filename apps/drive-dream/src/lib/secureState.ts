// Secure state management for UI state
// This replaces localStorage usage with server-side storage

export interface UIState {
  uploadedFile?: {
    name: string;
    type: string;
    size: number;
    data: string; // base64
  };
  sceneImage?: string;
  mapData?: {
    position: unknown;
    marker: unknown;
  };
  generatedImageUrl?: string;
}

// Store state in memory for the session (will be lost on page refresh)
// In a production app, you might want to store this in a database
const sessionState = new Map<string, UIState>();

export const secureState = {
  // Get state for a user
  getState: (userId: string): UIState => {
    return sessionState.get(userId) || {};
  },

  // Set state for a user
  setState: (userId: string, state: Partial<UIState>): void => {
    const currentState = sessionState.get(userId) || {};
    sessionState.set(userId, { ...currentState, ...state });
  },

  // Clear state for a user
  clearState: (userId: string): void => {
    sessionState.delete(userId);
  },

  // Update specific state property
  updateState: (userId: string, key: keyof UIState, value: unknown): void => {
    const currentState = sessionState.get(userId) || {};
    sessionState.set(userId, { ...currentState, [key]: value });
  },
};
