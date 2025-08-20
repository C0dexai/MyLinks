
import React, { useState, useEffect, useCallback } from 'react';
import { NotepadEntry } from '../types';

declare const marked: any;

interface NotepadViewProps {
    notepad: NotepadEntry | undefined;
    onUpdateNotepad: (entry: NotepadEntry) => Promise<void>;
}

const NotepadView: React.FC<NotepadViewProps> = ({ notepad, onUpdateNotepad }) => {
    const [markdown, setMarkdown] = useState('');
    const [html, setHtml] = useState('');

    useEffect(() => {
        if (notepad) {
            setMarkdown(notepad.content);
            setHtml(marked.parse(notepad.content));
        }
    }, [notepad]);

    const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newMarkdown = e.target.value;
        setMarkdown(newMarkdown);
        setHtml(marked.parse(newMarkdown));
    };

    const debouncedUpdate = useCallback((content: string) => {
        onUpdateNotepad({ id: 1, content });
    }, [onUpdateNotepad]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (notepad?.content !== markdown) {
                debouncedUpdate(markdown);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [markdown, notepad, debouncedUpdate]);

    return (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-700">
            <div className="p-4 flex flex-col bg-gray-800">
                 <textarea
                    value={markdown}
                    onChange={handleMarkdownChange}
                    className="w-full flex-grow resize-none focus:outline-none bg-gray-800 text-gray-200 form-input p-2"
                    placeholder="Write your notes in Markdown..."
                ></textarea>
            </div>
            <div
                className="prose prose-invert max-w-none bg-gray-900 w-full h-full p-4 overflow-y-auto neon-card"
                dangerouslySetInnerHTML={{ __html: html }}
            ></div>
        </div>
    );
};

export default NotepadView;
