import { create } from "zustand";

export interface Message {
  from: string;
  to: string;
  message: string;
  timestamp: string;
}

interface MessageStoreState {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
}

// Zustand store for message state
const useMessageStore = create<MessageStoreState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => {
    // Ensure the 'to' field is always included
    if (!message.to) {
      console.error("Message is missing 'to' field:", message);
      return state;
    }
    return { messages: [...state.messages, message] };
  }),
  setMessages: (messages) => set({ messages }),
}));

export default useMessageStore;
