import { ReactNode, createContext, useState } from 'react'
import { nanoid } from 'nanoid'
import { Message } from '@/lib/validators/message'

const defaultValue = [
  {
    id: nanoid(),
    text: 'Hello, how may I help you today?',
    isUserMessage: false,
  },
]
export const MessagesContext = createContext<{
    messages: Message[];
    isMessageUpdating: boolean;
    addMessage: (message: Message) => void;
    removeMessage: (id: string) => void;
    updateMessage: (id: string, updateFn: (prevText: string) => string) => void;
    setIsMessageUpdating: (isUpdating: boolean) => void;
}>({
    // Fallback values
    messages: [],
    isMessageUpdating: false,
    addMessage: () => {},
    removeMessage: () => {},
    updateMessage: () => {},
    setIsMessageUpdating: () => {},
});
// Messages Context Provider
export function MessagesProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>(defaultValue);
    const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false);

    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
    };

    const removeMessage = (id: string) => {
        setMessages((prev) => prev.filter((message) => message.id !== id));
    };

    const updateMessage = (
        id: string,
        updateFn: (prevText: string) => string
    ) => {
        setMessages((prev) =>
        prev.map((message) => {
            // If message has id that is being looked for
            if (message.id === id) {
                // Update message
                return { ...message, text: updateFn(message.text) };
            }
            // Else return message as is
            return message;
        })
        )
    };

    return (
        <MessagesContext.Provider
        value={{
            messages,
            isMessageUpdating,
            addMessage,
            removeMessage,
            updateMessage,
            setIsMessageUpdating,
        }}>
        {children}
        </MessagesContext.Provider>
    );
};