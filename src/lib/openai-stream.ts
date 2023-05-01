import { ParsedEvent, ReconnectInterval, createParser } from "eventsource-parser";

export type ChatGPTAgent = 'user' | 'system';

export interface ChatGPTMessage {
    role: ChatGPTAgent,
    content: string,
}

export interface OpenAIStreamPayload {
    model: string;
    messages: ChatGPTMessage[];
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    max_tokens: number;
    stream: boolean;
    n: number;
};
// OpenAI Message Stream Function
export async function OpenAIStream(payload: OpenAIStreamPayload) {
    // Text Encoder
    // - Takes a stream of code points as input and emits a stream of bytes
    const encoder = new TextEncoder();
    // Decoder
    const decoder = new TextDecoder();

    let counter = 0;
    // OpenAI Fetch Request
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      },
      body: JSON.stringify(payload),
    });
    // Readable Stream
    const stream = new ReadableStream({
      async start(controller: ReadableStreamDefaultController) {
        // onParse function for a parser instance
        function onParse(event: ParsedEvent | ReconnectInterval) {
          if (event.type === "event") {
            // Event data
            const data = event.data;
            // Reference: https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
            // If finished with the data then close the readable stream controller
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content || "";
              console.log('text', text);
              if (counter < 2 && (text.match(/\n/) || []).length) {
                // this is a prefix character (i.e., "\n\n"), do nothing
                return;
              }
              // Create a queue to enqueue in readable stream controller
              const queue: Uint8Array = encoder.encode(text);
              controller.enqueue(queue);
              counter++;
            } catch (e) {
              controller.error(e);
            }
          }
        };
        // Create an instance of a parser
        // - Feed it chunks of data - partial or complete
        // - The parse emits parsed messages once it receives a complete message
        // The stream response (SSE) from OpenAI may be fragmented into multiple chunks
        // this ensures we properly read chunks and invoke an event for each SSE event stream
        const parser = createParser(onParse);
        // Reference: https://web.dev/streams/#asynchronous-iteration
        // Split fetch request body into chunks to feed into parser
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        };
      },
    });

    return stream;
  }