import { chatbotPrompt } from "@/app/helpers/constants/chatbot-prompt";
import { ChatGPTMessage, OpenAIStream, OpenAIStreamPayload } from "@/lib/openai-stream";
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

    // Payload for OpenAI API
    const payload: OpenAIStreamPayload = {
        model: 'gpt-3.5-turbo',
        messages: outboundMessages,
        temperature: 0.4,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 150,
        stream: true,
        n: 1,
    };

    // Message Stream
    const stream = await OpenAIStream(payload);

    return new Response(stream);
}