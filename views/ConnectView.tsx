import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Link, Todo, ApiEndpoint, NotepadEntry, Instruction, OpenAiConfig } from '../types';

declare const marked: any;

interface MessageTurn {
    id: string;
    user: string;
    gemini: string;
    openai: string;
    geminiError?: string;
    openAiError?: string;
}

interface ConnectViewProps {
    links: Link[] | null;
    todos: Todo[] | null;
    notepad: NotepadEntry | undefined;
    endpoints: ApiEndpoint[] | null;
    instructions: Instruction | undefined;
    openAiConfig: OpenAiConfig | undefined;
}

const renderCustomMarkdown = (markdownText: string | undefined) => {
    if (!markdownText) return '';
    try {
        let html = marked.parse(markdownText);
        // Wrap lists in blockquotes per user request
        html = html.replace(/<ul>/g, '<blockquote><ul>');
        html = html.replace(/<\/ul>/g, '</ul></blockquote>');
        html = html.replace(/<ol>/g, '<blockquote><ol>');
        html = html.replace(/<\/ol>/g, '</ol></blockquote>');
        return html;
    } catch (e) {
        console.error("Markdown parsing error:", e);
        return '<p class="text-red-500">Error rendering content.</p>';
    }
};

const ModelResponseCard: React.FC<{ title: string; content: string; error?: string; logo: React.ReactNode }> = ({ title, content, error, logo }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="glass glass-subtle rounded-2xl flex flex-col w-full">
            <div className="flex justify-between items-center px-4 py-2 border-b border-[rgba(255,255,255,.15)]">
                <div className="flex items-center gap-2 font-bold text-gray-300">
                    {logo} {title}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleCopy} title="Copy Content" className="p-1.5 text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,.1)] rounded-md transition-colors">
                        {copySuccess ? <span>{copySuccess}</span> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
                    </button>
                    <button title="Bookmark (Feature coming soon)" className="p-1.5 text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,.1)] rounded-md transition-colors cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </button>
                </div>
            </div>
            <div className="p-4 prose prose-invert max-w-none prose-p:my-2 overflow-y-auto">
                {error ? <p className="text-red-400">{error}</p> : <div dangerouslySetInnerHTML={{ __html: renderCustomMarkdown(content) }} />}
            </div>
        </div>
    );
};


const ConnectView: React.FC<ConnectViewProps> = ({ links, todos, notepad, endpoints, instructions, openAiConfig }) => {
    const [turns, setTurns] = useState<MessageTurn[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const geminiChatRef = useRef<Chat | null>(null);

    const buildSystemPrompt = useCallback(() => {
        let appContext = "Here is the current state of the application, which you should be aware of in your responses:\n\n";
        if (!links && !todos && !notepad && !endpoints) {
            appContext += "The application state is currently empty. Encourage the user to add links, to-do items, or notes.\n";
        } else {
            if (links && links.length > 0) appContext += `Saved Links:\n${JSON.stringify(links.map(({id, description, url, category}) => ({id, description, url, category})), null, 2)}\n\n`;
            if (todos && todos.length > 0) appContext += `To-Do List:\n${JSON.stringify(todos, null, 2)}\n\n`;
            if (notepad && notepad.content) appContext += `Notepad Content:\n---\n${notepad.content}\n---\n\n`;
            if (endpoints && endpoints.length > 0) appContext += `Saved API Endpoints:\n${JSON.stringify(endpoints, null, 2)}\n\n`;
        }

        return `
You are an AI assistant integrated into a multi-tool web application. Your purpose is to help the user manage their tasks, links, and notes within this application.

Here are the user-defined instructions for how you should behave:
- System Orchestrator Instruction: ${instructions?.system || 'Default orchestrator instruction.'}
- AI Supervisor Instruction: ${instructions?.ai || 'Default supervisor instruction.'}

${appContext}

Engage in a helpful, conversational manner. Leverage the application context provided to give relevant and accurate assistance. Your responses MUST be in Markdown format. Wrap ALL lists (bulleted or numbered) inside a blockquote. For example: <blockquote><ul><li>Item 1</li></ul></blockquote>. Render syntax code inside a codeblock.
        `.trim();
    }, [links, todos, notepad, endpoints, instructions]);


    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = buildSystemPrompt();
            geminiChatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });
        } catch (error) {
            console.error("Failed to initialize Gemini chat:", error);
        }
    }, [buildSystemPrompt]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [turns]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        const turnId = Date.now().toString();
        const newTurn: MessageTurn = { id: turnId, user: currentInput, gemini: '', openai: '' };
        setTurns(prev => [...prev, newTurn]);

        // --- Gemini Request ---
        const geminiPromise = async () => {
            if (!geminiChatRef.current) {
                throw new Error("Gemini chat not initialized.");
            }
            const responseStream = await geminiChatRef.current.sendMessageStream({ message: currentInput });
            for await (const chunk of responseStream) {
                setTurns(prev => prev.map(t => t.id === turnId ? { ...t, gemini: t.gemini + chunk.text } : t));
            }
        };

        // --- OpenAI Request ---
        const openaiPromise = async () => {
            if (!openAiConfig?.apiKey) {
                throw new Error("OpenAI API key is not set. Please add it in the settings panel.");
            }
            const systemPrompt = buildSystemPrompt();
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiConfig.apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: currentInput }],
                    stream: true,
                }),
            });

            if (!response.ok || !response.body) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `OpenAI request failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
                for (const line of lines) {
                    const data = line.replace(/^data: /, '');
                    if (data === '[DONE]') break;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        if (content) {
                            setTurns(prev => prev.map(t => t.id === turnId ? { ...t, openai: t.openai + content } : t));
                        }
                    } catch (error) {
                        console.error('Error parsing OpenAI stream chunk:', error);
                    }
                }
            }
        };

        const results = await Promise.allSettled([geminiPromise(), openaiPromise()]);
        
        if (results[0].status === 'rejected') {
            const error = results[0].reason;
            setTurns(prev => prev.map(t => t.id === turnId ? { ...t, geminiError: error instanceof Error ? error.message : 'Unknown Gemini error' } : t));
        }
        if (results[1].status === 'rejected') {
            const error = results[1].reason;
            setTurns(prev => prev.map(t => t.id === turnId ? { ...t, openAiError: error instanceof Error ? error.message : 'Unknown OpenAI error' } : t));
        }

        setIsLoading(false);
    };

    return (
        <div className="w-full h-full flex flex-col p-4 sm:p-6 md:p-8">
            <div className="w-full h-full flex flex-col glass neon p-4 sm:p-6 overflow-hidden">
                <h1 className="text-2xl sm:text-3xl font-bold flex-shrink-0 pb-4 border-b border-[rgba(255,255,255,.15)]">Dual LLM Inference</h1>
                <div className="flex-grow overflow-y-auto py-4 pr-2 sm:pr-4 space-y-6">
                    {turns.map((turn) => (
                        <div key={turn.id} className="space-y-4">
                            {/* User Message */}
                            <div className="flex items-start gap-3 justify-end">
                                <div className="max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl bg-[rgba(0,229,255,0.2)] text-white rounded-br-none">
                                    <p>{turn.user}</p>
                                </div>
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center text-black font-bold shadow-[0_0_10px_var(--neon-blue)]">
                                    U
                                </div>
                            </div>
                            {/* AI Responses */}
                             <div className="flex flex-col md:flex-row items-start gap-4">
                                <ModelResponseCard title="Gemini" content={turn.gemini} error={turn.geminiError} logo={<span className="text-xl">✨</span>} />
                                <ModelResponseCard title="OpenAI" content={turn.openai} error={turn.openAiError} logo={<span className="text-xl">🧠</span>} />
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                           <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse delay-0"></span>
                           <span>Thinking...</span>
                           <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse delay-200"></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex-shrink-0 flex items-center gap-2 sm:gap-4 pt-4 border-t border-[rgba(255,255,255,.15)]">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask both AIs..."
                        className="form-input flex-grow p-3"
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn-primary p-3 disabled:opacity-50" disabled={isLoading || !userInput.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConnectView;