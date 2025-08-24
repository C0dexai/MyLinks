
export interface Link {
    id: number;
    description: string;
    url: string;
    isHome?: boolean;
    imageUrl?: string;
    visitCount?: number;
    rating?: number; // 0 to 5
    category: 'informative' | 'development';
}

export interface Todo {
    id: number;
    text: string;
    status: 'todo' | 'in-progress' | 'done';
}

export interface ApiEndpoint {
    id: number;
    name: string;
    url: string;
}

export interface NotepadEntry {
    id: number;
    content: string;
}

export interface Instruction {
    id: number;
    system: string;
    ai: string;
}

export interface OpenAiConfig {
    id: number;
    apiKey: string;
}

export interface StoredImage {
    id: number;
    name: string;
    dataUrl: string;
}

export enum View {
    AddLink = 'add-link-view',
    Pages = 'pages-view',
    Iframe = 'content-frame',
    Todo = 'todo-view',
    Notepad = 'notepad-view',
    AIConsole = 'ai-console-view',
    Connect = 'connect-view',
    Inference = 'inference-view',
    Rankings = 'rankings-view',
}