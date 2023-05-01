import { chatbotPrompt } from "@/app/helpers/constants/chatbot-prompt";
import { ChatGPTMessage } from "@/lib/openai-stream";
import { MessageArraySchema } from "@/lib/validators/message";

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Parse messages with custom schema
    const parsedMessages = MessageArraySchema.parse(messages);

    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => ({
        role: message.isUserMessage ? 'user' : 'system',
        content: message.text,
    }));

    outboundMessages.unshift({
        role: 'system',
        content: chatbotPrompt,
    });
}