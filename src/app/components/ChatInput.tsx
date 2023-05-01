"use client"

import { cn } from '@/lib/utils';
import { Message } from '@/lib/validators/message';
import { useMutation } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { FC, HTMLAttributes, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {

}

const ChatInput: FC<ChatInputProps> = ({ className, ...props }) => {

    const [input, setInput] = useState<string>('');

    const { mutate: sendMessage, isLoading } = useMutation({
        mutationFn: async (message: Message) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: [message] })
            });

            return response.body;
        },
        onSuccess: async (stream) => {
            if (!stream) throw new Error('No stream found')

            // construct new message to add
            // const id = nanoid()
            // const responseMessage: Message = {
            //   id,
            //   isUserMessage: false,
            //   text: '',
            // }

            // add new message to state
            // addMessage(responseMessage)

            // setIsMessageUpdating(true)

            // Stream Reader
            const reader = stream.getReader()
            // Stream Decoder
            const decoder = new TextDecoder()

            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading;
                // Decode and turn into readable string
                const chunkValue = decoder.decode(value);
            //   updateMessage(id, (prev) => prev + chunkValue);
                console.log(chunkValue);
            };

            // clean up
            // setIsMessageUpdating(false)
            // setInput('')

            // setTimeout(() => {
            //   textareaRef.current?.focus()
            // }, 10)
          },
    })

    return (
        <div {...props} className={cn('border-t border-zinc-300', className)}>
            <div className='relative mt-4 flex-1 overflow-hidden rounded-lg border-none outline-none'>
                <TextareaAutosize
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const message: Message = {
                                id: nanoid(),
                                isUserMessage: true,
                                text: input,
                            }
                            sendMessage(message);
                        }
                    }}
                    rows={2}
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                    placeholder='Write a message...'
                    className='peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6'
                />
            </div>
        </div>
    );
};

export default ChatInput