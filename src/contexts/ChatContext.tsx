import { createContext, useContext, useState } from 'react';

interface OpenChatTarget {
  partnerId: number;
  partnerName: string | null;
  partnerAvatar: string | null;
}

interface ChatContextValue {
  target: OpenChatTarget | null;
  openChat: (target: OpenChatTarget) => void;
  clearTarget: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<OpenChatTarget | null>(null);

  return (
    <ChatContext.Provider value={{
      target,
      openChat: (t) => setTarget(t),
      clearTarget: () => setTarget(null),
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}
