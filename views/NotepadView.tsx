import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NotepadEntry } from '../types';
import MonacoEditor from '../components/MonacoEditor';

// Make TypeScript aware of the globally available libraries
declare const marked: any;
declare const TurndownService: any;

interface NotepadViewProps {
    notepad: NotepadEntry | undefined;
    onUpdateNotepad: (entry: NotepadEntry) => Promise<void>;
}

type DocFormat = 'markdown' | 'html' | 'plaintext';

const NotepadView: React.FC<NotepadViewProps> = ({ notepad, onUpdateNotepad }) => {
    const [content, setContent] = useState('');
    const [previewContent, setPreviewContent] = useState('');
    const [inputFormat, setInputFormat] = useState<DocFormat>('markdown');
    const [outputFormat, setOutputFormat] = useState<DocFormat>('html');
    
    const [fetchUrl, setFetchUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const turndownService = useRef(new TurndownService());

    // Load initial content from DB
    useEffect(() => {
        if (notepad) {
            setContent(notepad.content);
        }
    }, [notepad]);

    // Debounced save to DB
    const debouncedUpdate = useCallback((newContent: string) => {
        onUpdateNotepad({ id: 1, content: newContent });
    }, [onUpdateNotepad]);

    useEffect(() => {
        const handler = setTimeout(() => {
            // Check if component is still mounted and content has changed
            if (notepad && notepad.content !== content) {
                debouncedUpdate(content);
            } else if (!notepad && content) { // Handle initial save
                 debouncedUpdate(content);
            }
        }, 1000); // 1 second debounce

        return () => {
            clearTimeout(handler);
        };
    }, [content, notepad, debouncedUpdate]);
    
    // Update preview when content or input format changes
    useEffect(() => {
        try {
            if (inputFormat === 'markdown') {
                setPreviewContent(marked.parse(content));
            } else if (inputFormat === 'html') {
                // To prevent style conflicts, render HTML in a sandboxed iframe
                const iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(
                    `<html><head><style>body{color: #E0E0E0; font-family: sans-serif; background-color: transparent;}</style></head><body>${content}</body></html>`
                )}`;
                setPreviewContent(iframeSrc);
            } else {
                setPreviewContent(content); // Plain text
            }
        } catch (e) {
            setPreviewContent('<p class="text-red-500">Error rendering preview.</p>');
        }
    }, [content, inputFormat]);

    const handleFetch = async () => {
        if (!fetchUrl) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            setContent(text);
            // Auto-detect format from URL
            if (fetchUrl.endsWith('.md')) setInputFormat('markdown');
            else if (fetchUrl.endsWith('.html')) setInputFormat('html');
            else setInputFormat('plaintext');

        } catch (e: any) {
            setError(`Failed to fetch content: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setContent(text);
             // Auto-detect format from file name
            if (file.name.endsWith('.md')) setInputFormat('markdown');
            else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) setInputFormat('html');
            else setInputFormat('plaintext');
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        let outputContent = '';
        let mimeType = 'text/plain';
        let fileExtension = 'txt';

        // Convert content if necessary
        const tempDiv = document.createElement('div');
        const htmlContent = (inputFormat === 'markdown') ? marked.parse(content) : (inputFormat === 'html' ? content : `<p>${content}</p>`);
        tempDiv.innerHTML = htmlContent;

        if (outputFormat === 'markdown') {
            outputContent = turndownService.current.turndown(htmlContent);
            mimeType = 'text/markdown';
            fileExtension = 'md';
        } else if (outputFormat === 'html') {
            outputContent = htmlContent;
            mimeType = 'text/html';
            fileExtension = 'html';
        } else { // plaintext
            outputContent = tempDiv.textContent || tempDiv.innerText || '';
            mimeType = 'text/plain';
            fileExtension = 'txt';
        }
        
        const blob = new Blob([outputContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getEditorLanguage = () => {
        if (inputFormat === 'markdown') return 'markdown';
        if (inputFormat === 'html') return 'html';
        return 'plaintext';
    };


    return (
        <div className="w-full h-full flex flex-col p-4 bg-gray-900 gap-4">
            {/* Controls Bar */}
            <div className="flex-shrink-0 neon-card p-3 rounded-lg flex flex-wrap items-center gap-4 text-sm">
                {/* File Operations */}
                <div className="flex items-center gap-2">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.html,.htm,.txt,.text" className="hidden" />
                     <button onClick={() => fileInputRef.current?.click()} className="btn-primary px-3 py-1.5 rounded-md">Load File</button>
                </div>

                {/* Fetch from URL */}
                 <div className="flex items-center gap-2 flex-grow min-w-[200px]">
                    <input type="url" value={fetchUrl} onChange={(e) => setFetchUrl(e.target.value)} placeholder="Fetch content from URL..." className="form-input flex-grow p-1.5" />
                    <button onClick={handleFetch} disabled={isLoading} className="btn-primary px-3 py-1.5 rounded-md disabled:opacity-50">
                        {isLoading ? 'Fetching...' : 'Fetch'}
                    </button>
                </div>

                {/* Format Selectors */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div>
                        <label className="mr-2 text-gray-400">Input:</label>
                        <select value={inputFormat} onChange={(e) => setInputFormat(e.target.value as DocFormat)} className="form-input p-1.5">
                            <option value="markdown">Markdown</option>
                            <option value="html">HTML</option>
                            <option value="plaintext">Plain Text</option>
                        </select>
                    </div>
                    <div>
                        <label className="mr-2 text-gray-400">Output:</label>
                        <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as DocFormat)} className="form-input p-1.5">
                            <option value="markdown">Markdown</option>
                            <option value="html">HTML</option>
                            <option value="plaintext">Plain Text</option>
                        </select>
                    </div>
                    <button onClick={handleDownload} className="btn-primary px-3 py-1.5 rounded-md">Download</button>
                </div>
            </div>
             {error && <div className="text-red-500 bg-red-900/50 p-2 rounded-md flex-shrink-0">{error}</div>}

            {/* Editor and Preview Panes */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                <div className="flex flex-col min-h-0">
                    <h2 className="text-lg font-semibold mb-2 text-gray-300">Editor</h2>
                    <div className="flex-grow min-h-0">
                        <MonacoEditor
                            value={content}
                            onChange={setContent}
                            language={getEditorLanguage()}
                        />
                    </div>
                </div>
                <div className="flex flex-col min-h-0">
                     <h2 className="text-lg font-semibold mb-2 text-gray-300">Live Preview</h2>
                     <div className="flex-grow bg-gray-800 p-4 rounded-lg border border-gray-700 overflow-y-auto prose prose-invert max-w-none">
                        {inputFormat === 'html' ? (
                             <iframe src={previewContent} title="HTML Preview" className="w-full h-full border-0 bg-transparent" sandbox=""></iframe>
                        ) : inputFormat === 'plaintext' ? (
                            <pre className="whitespace-pre-wrap">{previewContent}</pre>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default NotepadView;
