import React, { useRef, useEffect } from 'react';

// Make TS aware of Monaco global, which is loaded via script tag in index.html
declare const monaco: any;

interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    theme?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
    value,
    onChange,
    language = 'markdown',
    theme = 'vs-dark'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoInstanceRef = useRef<any>(null); // To hold the editor instance
    const subscriptionRef = useRef<any>(null); // To hold the event listener subscription

    useEffect(() => {
        // Ensure the loader script from index.html has run and `monaco` is available
        if (typeof monaco !== 'undefined' && editorRef.current) {
            
            monacoInstanceRef.current = monaco.editor.create(editorRef.current, {
                value,
                language,
                theme,
                automaticLayout: true,
                wordWrap: 'on',
                minimap: { enabled: false },
            });

            subscriptionRef.current = monacoInstanceRef.current.onDidChangeModelContent(() => {
                const currentValue = monacoInstanceRef.current.getValue();
                onChange(currentValue);
            });
        }

        // Cleanup on unmount
        return () => {
            subscriptionRef.current?.dispose();
            monacoInstanceRef.current?.dispose();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Effect to update editor value when prop changes from parent
    useEffect(() => {
        if (monacoInstanceRef.current) {
            const editorValue = monacoInstanceRef.current.getValue();
            if (editorValue !== value) {
                // To prevent resetting cursor position, only set value if it's different
                monacoInstanceRef.current.setValue(value);
            }
        }
    }, [value]);

    // Effect to update editor language when prop changes
    useEffect(() => {
        if (monacoInstanceRef.current && monacoInstanceRef.current.getModel()) {
            monaco.editor.setModelLanguage(monacoInstanceRef.current.getModel(), language);
        }
    }, [language]);

    return <div ref={editorRef} className="w-full h-full rounded-lg overflow-hidden"></div>;
};

export default MonacoEditor;